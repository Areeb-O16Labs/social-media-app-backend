import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { customResponseHandler, hashPassword } from 'src/config/helper';
import { Post } from 'src/posts/entities/post.entity';
import { Role } from './entities/role.entity';
import { userRoles } from 'src/config/enums';
import { Follow } from './entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly UserModel: Repository<User>,
    @InjectRepository(Post)
    private readonly postModel: Repository<Post>,
    @InjectRepository(Role)
    private readonly roleModel: Repository<Role>,
    @InjectRepository(Follow)
    private readonly followModel: Repository<Follow>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try{
      const users = new User();
      users.password = await hashPassword(createUserDto.password);
      users.username = createUserDto.username;
      users.email = createUserDto.email;
      let isEmailExists = await this.UserModel.findOneBy({email: createUserDto.email});
      if(isEmailExists){
        throw new InternalServerErrorException('Email already exists');
      }
      users.role = await this.roleModel.findOneBy({code: userRoles.USER})?.then(res => res.id) as any;
      await this.UserModel.save(users);
      return customResponseHandler(users, 'User created successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async findAll() {
    try{
      let users : any = this.UserModel.createQueryBuilder('user');
      users = await users.leftJoinAndSelect('user.role', 'role').orderBy('user.createdAt', 'DESC').getMany()
      return customResponseHandler(users, 'Users fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async findOne(id: string) {
    try {
      let user : any = this.UserModel.createQueryBuilder('user');
      user = await user.where('user.id = :id', { id }).getOne();
      if(user){
        return customResponseHandler(user, 'User fetch successfully');
      }
      throw new NotFoundException('User not found');
    } catch (e) {
      throw new InternalServerErrorException(e.message)
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try{
      let user : any = this.UserModel.findOneBy({id});
      if(user){
        let newData = new User();
        newData.username = updateUserDto.username || user.username;
        user = await this.UserModel.createQueryBuilder().update(User).set(newData).where('id = :id', { id }).returning('*').execute();
        return customResponseHandler(user, 'User updated successfully');
      }else{
        throw new NotFoundException('User not found');
      }
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async remove(id: string) {
    try{
      const user = await this.UserModel.delete({id});
      return customResponseHandler(user, 'User deleted successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async findAllRoles() {
    try{
      let roles : any = await this.roleModel.find({});
      return customResponseHandler(roles, 'Roles fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async follow(follower_id: string, user_id: string) {
    try{
      if(follower_id === user_id){
        throw new InternalServerErrorException('You cannot follow yourself');
      }
      const isIdExists = await this.UserModel.createQueryBuilder('user')
        .where('user.id = :follower_id', { follower_id })
        .getOne()

      if(!isIdExists){
        throw new NotFoundException('User not found');
      }

      const isFollowing = await this.followModel.createQueryBuilder('follow')
        .where('follow.following = :user_id', { user_id })
        .andWhere('follow.follower = :follower_id', { follower_id })
        .getOne()

      if(isFollowing){
        throw new InternalServerErrorException('You are already following this user');
      }

      let follow = new Follow();
      follow.follower = follower_id;
      follow.following = user_id;
      await this.followModel.save(follow);
      return customResponseHandler(follow, 'User followed successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async getFollowers(id: string) {
    try{
      let followers : any = await this.followModel.createQueryBuilder('follow')
        .where('follow.following = :id', { id })
        .leftJoinAndSelect('follow.follower', 'user')
        .getMany();
      let user : any = await this.UserModel.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
      return customResponseHandler({user, followers, totalFollowers: followers.length}, 'Followers fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }
}
