import { prisma } from "./prisma";

export async function saveChatHistory(_id: string, chatHistory: object) {
    await prisma.chatHistory.upsert({
        where: {
            id: _id
        },
        update: {
            messages: JSON.stringify(chatHistory)
        },
        create: {
            id: _id,
            messages: JSON.stringify(chatHistory)
        }
    });
}

export async function getChatHistory(_id: string) {
    try {
        const history = await prisma.chatHistory.findFirst({ where: { id: _id } });
        if (!history) {
            return [];
        } else {
            return JSON.parse(history.messages);
        }
    } catch (err) {
        return [];
    }
}

export async function deleteChatHistory(_id: string) {
    await prisma.chatHistory.delete({ where: { id: _id } });
}
