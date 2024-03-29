import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res } from "@nestjs/common";
import { UsPluzzlesService } from "./uspluzzles.service";
import { Response } from "express";
import { PluzzleService } from "src/pluzzles/pluzzles.service";
import { UserService } from "src/user/user.service";

@Controller()
export class UsPluzzlesController {

    constructor(
        private readonly usPluzzlesService: UsPluzzlesService,
        private readonly pluzzleService: PluzzleService,
        private readonly userService: UserService
    ) { }

    @Put('userPluzzle/update')
    async updateXpOfUserInPluzzle(
        @Query('id') id: string,
        @Body() datauserPluzzle: { userId: number, pluzzleId: number, xp: number },
        @Res() res: Response
    ): Promise<Response> {

        const upsertInUserPluzzle =
            await this.usPluzzlesService.updateXpOfUserInPluzzle({
                where: { id: Number(id) },
                data: datauserPluzzle
            })

        if (upsertInUserPluzzle) {
            return res.status(HttpStatus.OK).json({ message: 'Xp atualizado com sucesso' });
        } else {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Ops! Algo deu errado' });
        }
    }

    @Get('userPluzzle/buscar')
    async findUniqueUserPluzzle(
        @Query('userId') idUser: string,
        @Query('idPluzzle') idPluzzle: string,
        @Res() res: Response
    ): Promise<Response> {

        const user = await this.userService.findUser({
            id: Number(idUser)
        })

        const pluzzle = await this.pluzzleService.findUniquePluzzle({
            id: Number(idPluzzle)
        })

        if (user && pluzzle) {

            const userPluzzle = await this.usPluzzlesService.findRelationUserInPluzzle({
                where: { userId: user.id, pluzzleId: pluzzle.id }
            })

            if (userPluzzle) {

                return res.status(HttpStatus.OK).json(userPluzzle);

            } else {
                const usPlusCreate = await this.usPluzzlesService.createRelationUserInPluzzle({
                    pluzzle: pluzzle.id, user: user.id, xp: 0
                })

                return res.status(HttpStatus.OK).json({ message: "Relação não encontrada, porém, criada!", data: usPlusCreate })
            }

        } else {
            return res.status(HttpStatus.NOT_FOUND).json({ message: "Usuário ou Pluzzle não encontrado" });
        }
    }

    @Post("userPluzzle/create")
    async createXpOfUserInPluzzle(
        @Body() datauserPluzzle: { idUser: number, idPluzzle: number },
        @Res() res: Response
    ): Promise<Response> {

        const { idPluzzle, idUser } = datauserPluzzle;

        const user: any = await this.userService.findUser({ id: idUser });
        const pluzzle: any = await this.pluzzleService.findUniquePluzzle({ id: idPluzzle });

        if (user && pluzzle) {
            const createUserPluzzle =
                await this.usPluzzlesService.createRelationUserInPluzzle({ pluzzle: pluzzle, user: user, xp: 0 })

            if (createUserPluzzle) {
                return res.status(HttpStatus.CREATED).json({ message: 'Usuário introduzido ao pluzzle com sucesso!' });
            } else {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Ops! Algo deu errado' });
            }

        } else {
            return res.status(HttpStatus.NOT_FOUND).json({ message: 'Usuário ou Pluzzle não encontrado' });
        }

    }
}