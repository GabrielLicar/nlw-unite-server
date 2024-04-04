import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../lib/db";

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/events/:eventId/attendees", {
        schema: {
            summary: 'Get event attendees',
            tags: ['events'],
            params: z.object({
                eventId: z.string().uuid()
            }),
            querystring: z.object({
                query: z.string().nullish(),
                pageIndex: z.string().nullable().default('0').transform(Number),
            }),
            response: {
                200: z.object({
                    attendees: z.array(
                        z.object({
                            id: z.number(),
                            name: z.string(),
                            email: z.string().email(),
                            createdAt: z.date(),
                            checkedInAt: z.date().nullable()
                        })
                    )
                })
            },
        }
    }, async (req, reply) => {
        const { eventId } = req.params;
        const { pageIndex, query } = req.query;

        const attendees = await db.attendee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                checkIn: {
                    select: {
                        createdAt: true,
                    }
                }
            },
            where: query 
                ? {
                    eventId,
                    name: {
                        contains: query
                    }
                }
                : { eventId },
            take: 10,
            skip: pageIndex * 10,
            orderBy: {
                createdAt: 'desc'
            }
        })

        reply.send({ attendees: attendees.map(attendee => {
            return {
                id: attendee.id,
                name: attendee.name,
                email: attendee.email,
                createdAt: attendee.createdAt,
                checkedInAt: attendee.checkIn?.createdAt ?? null
            }
        }) });
    })
}