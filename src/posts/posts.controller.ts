import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from "@nestjs/swagger"
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('posts')

export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
  
  @Get('by-user/:id')
  @ApiBody({description: 'get post by user id'})
  getPostByUserId(@Param('id') id: string) {
    return this.postsService.getPostByUserId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  @ApiTags('Like')
  @Post('Like')
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiBody({schema: {properties: {post_id: {type: 'string'}}}})
  like(@Request() req, @Body() body: {post_id: string}) {
    const {post_id} = body;
    return this.postsService.like(post_id, req.user.userId);
  }

  @ApiTags('Like')
  @Get('Likes/:post_id')
  getLikes(@Param('post_id') post_id: string) {
    return this.postsService.getLikes(post_id);
  }
}
