import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBody, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('/roles')
  findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiTags('Follow')
  @Post('follow')
  @UseGuards(AuthGuard)
  @ApiSecurity('access-token')
  @ApiBody({schema: {properties: {follower_id: {type: 'string'}}}})
  follow(@Request() req: any, @Body() body: {follower_id: string}) {
    const {follower_id} = body;
    return this.usersService.follow(follower_id, req.user.userId);
  }

  @ApiTags('Follow')
  @Get('followers/:id')
  getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }
}
