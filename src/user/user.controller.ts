import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    Put,
    Delete,
    HttpStatus,
    Res,
    NotFoundException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { Users as UsersModel } from '@prisma/client'
import { Response } from 'express';

@Controller()
export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    @Get('user/:id')
    async getUniqueUser(@Param('id') id: string): Promise<UsersModel> {
        return this.userService.findUser({
            id: Number(id),
        })
    }

    @Get('users')
    async getUsers(): Promise<UsersModel[]> {
        return this.userService.findAllUsers({
        },);
    }

    @Delete('user/delete/:id')
    async deleteUser(@Param('id') id: string): Promise<UsersModel> {
        return this.userService.deleteUser({ id: Number(id) })
    }

    @Put('user/update/:id')
    async updateUser(
        @Param('id') id: string,
        @Body() userData: { name?: string, email?: string, code?: string, xp?: string }): Promise<UsersModel> {
        return this.userService.updateUser({
            where: { id: Number(id) },
            data: userData
        });
    }

    @Post('user/new')
    async createNewUser(
        @Body() userData: { 
            name: string, 
            email: string, 
            code: string, 
            xp?: string, 
            JWT?: string }): Promise<UsersModel> {
        return this.userService.createNewUser(userData);
    }

    @Post('user/login')
    async login(
        @Body() userData: { 
            name: string, 
            code: string },
        @Res() res: Response
    ): Promise<Response> {
        const user = await this.userService.login(userData);

        if (!user)
            throw new NotFoundException;

        return res.status(HttpStatus.OK).json(user);
    }
}