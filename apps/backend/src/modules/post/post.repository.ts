import { injectable, inject } from "inversify";
import { PrismaClient, Post, Prisma } from "../../generated/prisma/client";
import { TYPES } from "../../types";

@injectable()
export class PostRepository {
    constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) { }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return this.prisma.post.create({ data });
    }

    async findById(id: string): Promise<Post | null> {
        return this.prisma.post.findUnique({ where: { id } });
    }

    async createPostWithTransaction(
        transactionFn: (tx: Prisma.TransactionClient) => Promise<Post>
    ): Promise<Post> {
        return this.prisma.$transaction(transactionFn);
    }

    get client() {
        return this.prisma;
    }
}
