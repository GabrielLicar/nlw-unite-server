import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../lib/db";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
    app
        .withTypeProvider<ZodTypeProvider>()
        .get('/attendees/:attendeeId/badge', {
            schema: {
                summary: 'Get an attendee badge',
                tags: ['attendees'],
                params: z.object({
                    attendeeId: z.coerce.number().int(),
                }),
                response: {
                    200: z.object({
                        badge: z.object({
                            name: z.string(),
                            email: z.string().email(),
                            title: z.string(),
                            checkInURL: z.string().url(),
                        })
                    })
                },
            }
        }, async (req, reply) => {
            const { attendeeId } = req.params;

            const attendee = await db.attendee.findUnique({
                select: {
                    name: true,
                    email: true,
                    event: {
                        select: {
                            title: true,
                        }
                    }
                },
                where: {
                    id: attendeeId,
                }
            })

            if (attendee === null) {
                throw new BadRequest('Attendee not found.')
            }

            const baseURL = `${req.protocol}://${req.hostname}`

            const checkInURL = new URL(`/attendees/${attendeeId}/check-in`, baseURL);

            return reply.send({
                badge: {
                    name: attendee.name,
                    email: attendee.email,
                    title: attendee.event.title,
                    checkInURL: checkInURL.toString(),
                }
            })
        });
}