import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    if (await this.productsRepository.findByName(name)) {
      throw new AppError('This product name is already in use.', 400);
    }

    const customer = await this.productsRepository.create({
      name,
      price,
      quantity,
    });

    return customer;
  }
}

export default CreateProductService;
