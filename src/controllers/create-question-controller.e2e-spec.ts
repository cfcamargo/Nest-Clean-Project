import { PrismaService } from "@/prisma/prisma.service";
import { AppModule } from "../app.module";
import { INestApplication } from "@nestjs/common";
import {Test} from '@nestjs/testing'
import request from 'supertest'
import { hash } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";

describe('Authenticate (E2E)', () => {
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

    test('[POST] /questions'), async () => {
        const user = await prisma.user.create({
            data: {
                name: 'Jhon Doe',
                email: 'jhondoe@example.com',
                password: '123456'
            }
        })

        const access_token = jwt.sign({ sub: user.id })

        const response = await request(app.getHttpServer())
        .post('/questions')
        .set('Authorization', `Bearer ${access_token}`)
        .send({
            title: 'New Question',
            content: 'Question Content'
        })

        expect(response.statusCode).toBe(201)
        

        const questionInDatabase = await prisma.question.findFirst({
            where: {
                title: 'New Question'
            }
        })
        expect(questionInDatabase).toBeTruthy()
    }
})