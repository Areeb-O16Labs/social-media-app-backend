import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { customResponseHandler } from 'src/config/helper';
import { User } from 'src/users/entities/user.entity';
import { Like } from './entities/like.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly PostModel: Repository<Post>,
    @InjectRepository(User)
    private readonly UserModel: Repository<User>,
    @InjectRepository(Like)
    private readonly likeModel: Repository<Like>,
  ){}
  async create(createPostDto: CreatePostDto, user_id: string) {
    try{
      let posts = new Post();
      posts.title = createPostDto.title;
      posts.body = createPostDto.body;
      posts.status = createPostDto.status;
      posts.user = user_id;
      let response = await this.PostModel.save(posts);
      return customResponseHandler(response, 'Post created successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async findAll() {
    try{
      let posts : any = this.PostModel.createQueryBuilder('post');
      posts = await posts.leftJoinAndSelect('post.user', 'user').orderBy('post.createdAt', 'DESC').getMany()
      return customResponseHandler(posts, 'Posts fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async findOne(id: string) {
      try {
        let post : any = this.PostModel.createQueryBuilder('post');
        post = await post.where('post.id = :id', { id }).getOne();
        if(post){
          return customResponseHandler(post, 'post fetch successfully');
        }
        throw new InternalServerErrorException('post not found');
      } catch (e) {
        throw new InternalServerErrorException(e.message)
      }
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
      try{
        let post : any = this.PostModel.findOneBy({id});
        if(post){
          let newData = new Post();
          newData.body = updatePostDto.body || post.body;
          newData.title = updatePostDto.title || post.title;
          newData.status = updatePostDto.status || post.status;
          const response = await this.PostModel.createQueryBuilder().update(Post).set(newData).where('id = :id', { id }).returning('*').execute();
          return customResponseHandler(response, 'post updated successfully');
        }else{
          throw new InternalServerErrorException('post not found');
        }
      }catch(e){
        throw new InternalServerErrorException(e.message)
      }
    }

  async remove(id: string) {
    try{
      let post : any = await this.PostModel.findOne({where: {id}});
      if(post){
        post = await this.PostModel.delete({id});
        return customResponseHandler(Post, 'Post deleted successfully');
      }else{
        throw new InternalServerErrorException('Post not found');
      }
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }
  async getPostByUserId(id: string) {
    try{
      console.log(await this.PostModel.find({}));
      let post : any;
      post = await this.PostModel.createQueryBuilder('post').where('post.user = :id', { id }).getMany();
      let user : any = await this.UserModel.createQueryBuilder('user').where('user.id = :id', { id }).getOne();
      return customResponseHandler({user, post}, 'Post fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }

  async like(post_id: string, user_id: string) {
    try{
      let post : any = await this.PostModel.findOne({where: {id: post_id}})
      if(post){
        let isLiked = await this.likeModel.createQueryBuilder('like').where('like.post = :post_id', { post_id }).andWhere('like.user = :user_id', { user_id }).getOne();
        let res : any;
        if(isLiked){
          res = await this.likeModel.delete({id: isLiked.id});
        }else{
          let like = new Like();
          like.post = post_id;
          like.user = user_id;
          res = await this.likeModel.save(like);
        }
        return customResponseHandler(res, 'Post liked/unliked successfully');
      }
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  } 

  async getLikes(post_id: string) {
    try{
      let getLikes : any = await this.likeModel.createQueryBuilder('like').where('like.post = :post_id', { post_id });
      let likes = await getLikes.leftJoinAndSelect('like.user', 'user').getMany();
      let totalLikes = await getLikes.getCount();
      return customResponseHandler({likes, totalLikes}, 'Likes fetch successfully');
    }catch(e){
      throw new InternalServerErrorException(e.message)
    }
  }
}

