import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../lib/db";

export async function getAttendeeBadge(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/badge', {
        schema: {
            params: z.object({
                attendeeId: z.coerce.number().int(),
            }),
            response: {},
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
            throw new Error('Attendee not found.')
        }

        return reply.send({ attendee })
    });
}