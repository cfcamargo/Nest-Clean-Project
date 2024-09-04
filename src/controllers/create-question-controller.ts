import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { title } from "process";
import { CurrentUser } from "src/auth/current-user-decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UserPayload } from "src/auth/jwt.strategy";
import { ZodValidationPipe } from "src/pipes/zod-validation-pipe";
import { PrismaService } from "src/prisma/prisma.service";
import { z } from "zod";

const createQuestionBodySchema = z.object({
    title: z.string(),
    content: z.string()
})

const bodyValidationPipe = new ZodValidationPipe(createQuestionBodySchema)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>


@Controller("/questions")
@UseGuards(JwtAuthGuard)
export class CreateQuestionController {
    constructor(
        private prisma: PrismaService
    ) {}

    @Post()
    async handle(
        @Body(bodyValidationPipe) body: CreateQuestionBodySchema,
        @CurrentUser() user:UserPayload
    ) {
        
        const { title, content } = body
        const userId = user.sub

        const slug = this.generateSlug(title)

        await this.prisma.question.create({
            data: {
                content,
                title,
                slug,
                authorId: userId
            }
        })
    }

    private generateSlug(title: string): string {
        return title
          .toLowerCase() // Converte para minúsculas
          .normalize('NFD') // Separa os caracteres especiais dos acentos
          .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
          .trim() // Remove espaços extras no início e fim
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .replace(/-+/g, '-'); // Substitui múltiplos hífens por um único
    }
}