const { Venta, VentaItem, Producto, Configuracion } = require('../models');

async function list(req, res, next) {
  try {
    const ventas = await Venta.findAll({
      include: [{ model: VentaItem, include: [Producto] }],
      order: [['id', 'DESC']],
    });
    res.json(ventas);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { fecha, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'La venta debe tener al menos un producto' });
    }

    const productos = await Producto.findAll({
      where: { id: items.map((i) => i.productoId) },
    });

    for (const item of items) {
      const producto = productos.find((p) => p.id === item.productoId);
      if (!producto) return res.status(400).json({ message: 'Producto invalido' });
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ message: `Stock insuficiente de ${producto.nombre}` });
      }
    }

    const subtotal = items.reduce((acc, item) => {
      const producto = productos.find((p) => p.id === item.productoId);
      return acc + Number(producto.precioVenta) * item.cantidad;
    }, 0);

    const config = await Configuracion.findByPk(1);
    const ivaPorcentaje = config ? Number(config.ivaPorcentaje) : 16;
    const ivaMonto = Number((subtotal * (ivaPorcentaje / 100)).toFixed(2));
    const total = Number((subtotal + ivaMonto).toFixed(2));

    const venta = await Venta.create({ fecha: fecha || new Date(), subtotal, ivaMonto, total });

    for (const item of items) {
      const producto = productos.find((p) => p.id === item.productoId);
      await VentaItem.create({
        ventaId: venta.id,
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: producto.precioVenta,
        importe: Number(producto.precioVenta) * item.cantidad,
      });
      await producto.update({ stock: producto.stock - item.cantidad });
    }

    const ventaCompleta = await Venta.findByPk(venta.id, {
      include: [{ model: VentaItem, include: [Producto] }],
    });
    res.status(201).json(ventaCompleta);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
