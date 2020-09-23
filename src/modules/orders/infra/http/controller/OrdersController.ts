import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findOrder = container.resolve(FindOrderService);

    const order = await findOrder.execute({ id });

    // return response.json(order);

    if (!order) {
      return response.json({});
    }

    return response.json({
      ...order,
      order_products: order?.order_products.map(order_product => ({
        ...order_product,
        price: order_product.price.toFixed(2),
      })),
    });
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const createOrder = container.resolve(CreateOrderService);

    const order = await createOrder.execute({
      customer_id,
      products,
    });

    return response.json({
      ...order,
      order_products: order.order_products.map(order_product => ({
        ...order_product,
        price: order_product.price.toFixed(2),
      })),
    });
  }
}
