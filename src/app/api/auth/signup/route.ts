import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req:Request) {
    try {
        const {name, email, password}= await req.json();

        const existUser = await prisma.user.findUnique({where: {email}})
        if(existUser){
            return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = await prisma.user.create({
            data:{name, email, password: hashedPassword}
        });

        return NextResponse.json({massege: " User created Successfully!", user: newUser}, {status: 201});

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}