import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { checkPassword, customResponseHandler } from 'src/config/helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly UserModal: Repository<User>,
    private readonly jwtService: JwtService,
  ){}

  async login(createAuthDto: CreateAuthDto) {
    try{
      let user = await this.UserModal.createQueryBuilder('user')
        .where('user.email = :email', { email: createAuthDto.email })
        .leftJoinAndSelect('user.role', 'role')
        .getOne();
      if(user){
        const match = await checkPassword(createAuthDto.password, user.password);
        if (match) {
          const payload = { userId: user.id };
          const token = await this.jwtService.signAsync(payload);
          return customResponseHandler(
            { user, token },
            'User logged in successfully',
          );
        }
        throw new InternalServerErrorException('Invalid Password!');
      }
      throw new InternalServerErrorException('Invalid Credentials!');
    }catch(err){
      throw new InternalServerErrorException(err.message);
    }
  }
  
  async existingUserBy(key: string, value: string): Promise<User> {
    return await this.UserModal.findOne({
      where: { [key]: value },
    });
  }
}
