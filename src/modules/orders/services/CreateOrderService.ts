import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer not found!', 400);
    }

    const foundProducts = await this.productsRepository.findAllById(products);

    if (foundProducts.length !== products.length) {
      throw new AppError('Invalid products!', 400);
    }

    const productsWithInvalidQuantity = products.filter(
      product =>
        product.quantity >
        (foundProducts.find(foundProduct => foundProduct.id === product.id)
          ?.quantity || 0),
    );

    if (productsWithInvalidQuantity.length > 0) {
      throw new AppError(
        'There are some products with insufficient quantities!',
        400,
      );
    }

    const order = await this.ordersRepository.create({
      customer,
      products: products.map(product => ({
        product_id: product.id,
        price:
          foundProducts.find(foundProduct => foundProduct.id === product.id)
            ?.price || 0,
        quantity: product.quantity,
      })),
    });

    const updatedProducts = foundProducts.map(foundProduct => ({
      ...foundProduct,
      quantity:
        foundProduct.quantity -
        (products.find(product => product.id === foundProduct.id)?.quantity ||
          0),
    }));

    await this.productsRepository.updateQuantity(updatedProducts);

    return order;
  }
}

export default CreateOrderService;
