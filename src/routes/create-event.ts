import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../lib/db";
import { generateSlug } from "../utils/generate-slug";
import { BadRequest } from "./_errors/bad-request";

export async function createEventRoute(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>()
        .post('/events', {
            schema: {
                summary: 'Create an event',
                tags: ['events'],
                body: z.object({
                    title: z.string().min(4),
                    details: z.string().nullable(),
                    maximumAttendees: z.number().int().positive().nullable()
                }),
                response: {
                    201: z.object({
                        eventId: z.string().uuid()
                    })
                }
            }
        }, async (req, reply) => {

            const { title, details, maximumAttendees } = req.body;

            const slug = generateSlug(title);

            const eventWithSameSlug = await db.event.findUnique({
                where: { slug }
            })

            if (eventWithSameSlug !== null) {
                throw new BadRequest('Another event with same title already exists');
            }

            const event = await db.event.create({
                data: {
                    title,
                    slug,
                    details,
                    maximumAttendees,
                }
            })
            return reply.status(201).send({ eventId: event.id });
        })
}