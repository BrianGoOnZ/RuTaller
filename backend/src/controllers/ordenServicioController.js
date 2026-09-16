const {
  OrdenServicio,
  OrdenServicioChecklistItem,
  OrdenServicioFoto,
  OrdenServicioItem,
  GarantiaEvento,
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
  { model: OrdenServicioItem, where: { garantiaEventoId: null }, required: false, include: [Producto] },
  {
    model: GarantiaEvento,
    include: [{ model: OrdenServicioItem, include: [Producto] }],
  },
];

async function eliminarOrdenCompleta(ordenServicioId) {
  const items = await OrdenServicioItem.findAll({ where: { ordenServicioId } });
  for (const item of items) {
    if (item.tipo === 'producto' && item.productoId) {
      const producto = await Producto.findByPk(item.productoId);
      if (producto) await producto.update({ stock: producto.stock + item.cantidad });
    }
  }

  await OrdenServicioItem.destroy({ where: { ordenServicioId } });
  await OrdenServicioChecklistItem.destroy({ where: { ordenServicioId } });
  await OrdenServicioFoto.destroy({ where: { ordenServicioId } });
  await GarantiaEvento.destroy({ where: { ordenServicioId } });
  await OrdenServicio.destroy({ where: { id: ordenServicioId } });
}

async function calcularIvaPorcentaje() {
  const config = await Configuracion.findByPk(1);
  return config ? Number(config.ivaPorcentaje) : 16;
}

async function recalcularTotales(ordenServicioId, garantiaEventoId = null) {
  const items = await OrdenServicioItem.findAll({
    where: { ordenServicioId, garantiaEventoId },
  });
  const subtotal = items.reduce((acc, item) => acc + Number(item.importe), 0);
  const ivaPorcentaje = await calcularIvaPorcentaje();
  const ivaMonto = Number((subtotal * (ivaPorcentaje / 100)).toFixed(2));
  const total = Number((subtotal + ivaMonto).toFixed(2));

  if (garantiaEventoId) {
    await GarantiaEvento.update({ subtotal, ivaMonto, total }, { where: { id: garantiaEventoId } });
  } else {
    await OrdenServicio.update({ subtotal, ivaMonto, total }, { where: { id: ordenServicioId } });
  }
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
    const orden = await OrdenServicio.findByPk(req.params.id, {
      include: includeCompleto,
      order: [[GarantiaEvento, 'id', 'ASC']],
    });
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
    const camposFecha = ['fechaEntregaEstimada', 'fechaEntregaReal'];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] === undefined) return;
      const valor = req.body[campo];
      cambios[campo] = camposFecha.includes(campo) && valor === '' ? null : valor;
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

async function crearGarantiaEvento(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id, { include: [GarantiaEvento] });
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    if (!orden.fechaEntregaReal) {
      return res.status(400).json({ message: 'La orden todavia no se ha entregado' });
    }

    const abierto = orden.GarantiaEventos?.find((g) => !g.fechaEntrega);
    if (abierto) {
      return res.status(400).json({ message: 'Ya hay un reingreso por garantia abierto sin resolver' });
    }

    const fechaReingreso = req.body.fechaReingreso || new Date().toISOString().slice(0, 10);
    await GarantiaEvento.create({ ordenServicioId: orden.id, fechaReingreso });
    await orden.update({ estado: 'garantia' });

    const ordenCompleta = await OrdenServicio.findByPk(orden.id, { include: includeCompleto });
    res.status(201).json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function actualizarGarantiaEvento(req, res, next) {
  try {
    const evento = await GarantiaEvento.findOne({
      where: { id: req.params.garantiaId, ordenServicioId: req.params.id },
    });
    if (!evento) return res.status(404).json({ message: 'Reingreso por garantia no encontrado' });

    const camposPermitidos = ['diagnostico', 'fechaEntrega', 'firmaClienteEntrega'];
    const cambios = {};
    camposPermitidos.forEach((campo) => {
      if (req.body[campo] === undefined) return;
      const valor = req.body[campo];
      cambios[campo] = campo === 'fechaEntrega' && valor === '' ? null : valor;
    });

    await evento.update(cambios);

    if (cambios.fechaEntrega) {
      await OrdenServicio.update({ estado: 'entregada' }, { where: { id: req.params.id } });
    }

    const ordenCompleta = await OrdenServicio.findByPk(req.params.id, { include: includeCompleto });
    res.json(ordenCompleta);
  } catch (err) {
    next(err);
  }
}

async function agregarItem(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });

    const { tipo, productoId, descripcion, cantidad, costoUnitario, garantiaEventoId } = req.body;
    const cantidadFinal = cantidad || 1;

    if (garantiaEventoId) {
      const evento = await GarantiaEvento.findOne({
        where: { id: garantiaEventoId, ordenServicioId: orden.id },
      });
      if (!evento) return res.status(400).json({ message: 'Reingreso por garantia invalido' });
    }

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
        garantiaEventoId: garantiaEventoId || null,
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
        garantiaEventoId: garantiaEventoId || null,
        tipo: 'mano_obra',
        descripcion,
        cantidad: cantidadFinal,
        costoUnitario,
        importe: Number(costoUnitario) * cantidadFinal,
      };
    }

    await OrdenServicioItem.create(itemData);
    await recalcularTotales(orden.id, garantiaEventoId || null);

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

    const garantiaEventoId = item.garantiaEventoId;
    await item.destroy();
    await recalcularTotales(req.params.id, garantiaEventoId || null);

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

async function remove(req, res, next) {
  try {
    const orden = await OrdenServicio.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
    await eliminarOrdenCompleta(orden.id);
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
  remove,
  crearGarantiaEvento,
  actualizarGarantiaEvento,
  agregarItem,
  eliminarItem,
  agregarFoto,
  eliminarFoto,
  eliminarOrdenCompleta,
};
