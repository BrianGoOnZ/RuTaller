const {
  OrdenServicio,
  OrdenServicioChecklistItem,
  OrdenServicioFoto,
  OrdenServicioItem,
  Moto,
  Cliente,
  Producto,
  Configuracion,
} = require('../models');
const { CHECKLIST_ITEMS } = require('../utils/constants');

const includeCompleto = [
  { model: Moto, include: [Cliente] },
  OrdenServicioChecklistItem,
  OrdenServicioFoto,
  { model: OrdenServicioItem, include: [Producto] },
  { model: OrdenServicio, as: 'ordenGarantiaOriginal' },
];

async function recalcularTotales(ordenServicioId) {
  const items = await OrdenServicioItem.findAll({ where: { ordenServicioId } });
  const subtotal = items.reduce((acc, item) => acc + Number(item.importe), 0);
  const config = await Configuracion.findByPk(1);
  const ivaPorcentaje = config ? Number(config.ivaPorcentaje) : 16;
  const ivaMonto = Number((subtotal * (ivaPorcentaje / 100)).toFixed(2));
  const total = Number((subtotal + ivaMonto).toFixed(2));

  await OrdenServicio.update(
    { subtotal, ivaMonto, total },
    { where: { id: ordenServicioId } }
  );
}

async function list(req, res, next) {
  try {
    const { estado, motoId, q } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (motoId) where.motoId = motoId;

    const ordenes = await OrdenServicio.findAll({
      where,
      include: [{ model: Moto, include: [Cliente] }],
      order: [['id', 'DESC']],
    });

    const filtradas = q
      ? ordenes.filter((o) => {
          const texto = `${o.id} ${o.Moto?.placas || ''} ${o.Moto?.Cliente?.nombre || ''}`.toLowerCase();
          return texto.includes(q.toLowerCase());
        })
      : ordenes;

    res.json(filtradas);
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id, { include: includeCompleto });
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    res.json(orden);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const {
      motoId,
      fechaIngreso,
      horaIngreso,
      fechaEntregaEstimada,
      kilometraje,
      nivelGasolina,
      nivelAceite,
      trabajoSolicitado,
      enGarantia,
      ordenGarantiaOriginalId,
      firmaClienteRecepcion,
      checklist,
    } = req.body;

    const moto = await Moto.findByPk(motoId);
    if (!moto) return res.status(400).json({ message: 'Moto invalida' });

    const orden = await OrdenServicio.create({
      motoId,
      fechaIngreso,
      horaIngreso,
      fechaEntregaEstimada,
      kilometraje,
      nivelGasolina,
      nivelAceite,
      trabajoSolicitado,
      enGarantia: !!enGarantia,
      ordenGarantiaOriginalId: enGarantia ? ordenGarantiaOriginalId || null : null,
      firmaClienteRecepcion: !!firmaClienteRecepcion,
      estado: 'recibida',
    });

    const items = CHECKLIST_ITEMS.map((nombre) => {
      const provisto = Array.isArray(checklist) && checklist.find((c) => c.nombre === nombre);
      return {
        ordenServicioId: orden.id,
        nombre,
        estado: provisto?.estado || null,
        nota: provisto?.nota || null,
      };
    });
    await OrdenServicioChecklistItem.bulkCreate(items);

    const ordenCompleta = await OrdenServicio.findByPk(orden.id, { include: includeCompleto });
    res.status(201).json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });

    const camposPermitidos = [
      'fechaEntregaEstimada',
      'fechaEntregaReal',
      'kilometraje',
      'nivelGasolina',
      'nivelAceite',
      'trabajoSolicitado',
      'diagnostico',
      'estado',
      'firmaClienteRecepcion',
      'firmaClienteEntrega',
    ];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
    });

    await orden.update(cambios);

    if (Array.isArray(req.body.checklist)) {
      for (const item of req.body.checklist) {
        await OrdenServicioChecklistItem.update(
          { estado: item.estado, nota: item.nota },
          { where: { ordenServicioId: orden.id, nombre: item.nombre } }
        );
      }
    }

    const ordenCompleta = await OrdenServicio.findByPk(orden.id, { include: includeCompleto });
    res.json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function agregarItem(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });

    const { tipo, productoId, descripcion, cantidad, costoUnitario } = req.body;
    const cantidadFinal = cantidad || 1;

    let itemData;
    if (tipo === 'producto') {
      const producto = await Producto.findByPk(productoId);
      if (!producto) return res.status(400).json({ message: 'Producto invalido' });
      if (producto.stock < cantidadFinal) {
        return res.status(400).json({ message: 'Stock insuficiente' });
      }

      await producto.update({ stock: producto.stock - cantidadFinal });

      itemData = {
        ordenServicioId: orden.id,
        tipo: 'producto',
        productoId: producto.id,
        descripcion: producto.nombre,
        cantidad: cantidadFinal,
        costoUnitario: producto.precioVenta,
        importe: Number(producto.precioVenta) * cantidadFinal,
      };
    } else {
      itemData = {
        ordenServicioId: orden.id,
        tipo: 'mano_obra',
        descripcion,
        cantidad: cantidadFinal,
        costoUnitario,
        importe: Number(costoUnitario) * cantidadFinal,
      };
    }

    await OrdenServicioItem.create(itemData);
    await recalcularTotales(orden.id);

    const ordenCompleta = await OrdenServicio.findByPk(orden.id, { include: includeCompleto });
    res.status(201).json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function eliminarItem(req, res, next) {
  try {
    const item = await OrdenServicioItem.findOne({
      where: { id: req.params.itemId, ordenServicioId: req.params.id },
    });
    if (!item) return res.status(404).json({ message: 'Item no encontrado' });

    if (item.tipo === 'producto' && item.productoId) {
      const producto = await Producto.findByPk(item.productoId);
      if (producto) await producto.update({ stock: producto.stock + item.cantidad });
    }

    await item.destroy();
    await recalcularTotales(req.params.id);

    const ordenCompleta = await OrdenServicio.findByPk(req.params.id, { include: includeCompleto });
    res.json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function agregarFoto(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!req.file) return res.status(400).json({ message: 'No se recibio ninguna imagen' });

    const foto = await OrdenServicioFoto.create({
      ordenServicioId: orden.id,
      path: req.file.filename,
    });
    res.status(201).json(foto);
  } catch (err) {
    next(err);
  }
}

async function eliminarFoto(req, res, next) {
  try {
    const foto = await OrdenServicioFoto.findOne({
      where: { id: req.params.fotoId, ordenServicioId: req.params.id },
    });
    if (!foto) return res.status(404).json({ message: 'Foto no encontrada' });
    await foto.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getOne,
  create,
  update,
  agregarItem,
  eliminarItem,
  agregarFoto,
  eliminarFoto,
};
