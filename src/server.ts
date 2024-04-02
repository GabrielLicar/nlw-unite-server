import fastify from "fastify";
import { z } from "zod";
import { db } from "./lib/db";

const app = fastify();

app.post('/events', async (req, reply) => {
    const createEventSchema = z.object({
        title: z.string().min(4),
        details: z.string().nullable(),
        maximumAttendees: z.number().int().positive().nullable()
    })

    const { title, details, maximumAttendees } = createEventSchema.parse(req.body);

    const event = await db.event.create({
        data: {
            title,
            slug: new Date().toISOString(),
            details,
            maximumAttendees,
        }
    })
    return reply.status(201).send({ eventId: event.id });
})

app.listen({ port: 3333 }).then(() => console.log("🚀 HTTP Server running"));