import { PrismaService } from "@/prisma/prisma.service";
import { AppModule } from "../app.module";
import { INestApplication } from "@nestjs/common";
import {Test} from '@nestjs/testing'
import request from 'supertest'
import { hash } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

describe('Fetch Recet Questions (E2E)', () => {
    let app: INestApplication;
    let prisma: PrismaService
    let jwt: JwtService
    
    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
    
        app = moduleRef.createNestApplication()

        prisma = moduleRef.get(PrismaService)
        jwt = moduleRef.get(JwtService)

        await app.init();
    });

    test('[GET] /questions'), async () => {
        const user = await prisma.user.create({
            data: {
                name: 'Jhon Doe',
                email: 'jhondoe@example.com',
                password: '123456'
            }
        })

        const access_token = jwt.sign({ sub: user.id })

        await prisma.question.createMany({
            data: [
                {
                    title: 'Question 01',
                    slug: 'question-01',
                    content: 'question content',
                    authorId: user.id
                },
                {
                    title: 'Question 02',
                    slug: 'question-02',
                    content: 'question content',
                    authorId: user.id
                },
                {
                    title: 'Question 03',
                    slug: 'question-03',
                    content: 'question content',
                    authorId: user.id
                }
            ]
        })

        const response = await request(app.getHttpServer())
        .get('/questions')
        .set('Authorization', `Bearer ${access_token}`)
        .send()

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({
            questions: [
                expect.objectContaining({title: 'Question 01'}),
                expect.objectContaining({title: 'Question 02'}),
                expect.objectContaining({title: 'Question 03'})
            ]
        })
    }
})