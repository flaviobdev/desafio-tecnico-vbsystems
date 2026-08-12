import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeraBoxService } from '../gateway-integration/lera-box.service';
import { CreateGatewayUserDto } from '../gateway-integration/dto/create-gateway-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly leraBox: LeraBoxService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateGatewayUserDto) {
    await this.leraBox.createUser(data);

    const user = this.usersRepository.create(data);

    return this.usersRepository.save(user);
  }
}
