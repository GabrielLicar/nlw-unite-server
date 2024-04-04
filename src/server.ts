import fastify from "fastify";

import fastifyCors from "@fastify/cors";
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from "@fastify/swagger-ui";

import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { errorHandler } from "./error-handler";
import { checkIn } from "./routes/check-in";
import { createEventRoute } from "./routes/create-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";
import { getEvent } from "./routes/get-event";
import { getEventAttendees } from "./routes/get-event-attendees";
import { registerForEvent } from "./routes/register-for-event";

const app = fastify();

app.register(fastifyCors, {
    origin: '*',
})

app.register(fastifySwagger, {
    swagger: {
        consumes: ['application/json'],
        produces: ['application/json'],
        info: {
            title: 'pass.in',
            description: 'Especificações da API para o back-end da aplicação pass.in construída durante o NLW Unite da Rocketseat',
            version: '1.0.0'
        },
    },
    transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEventRoute);
app.register(registerForEvent);
app.register(getEvent);
app.register(getEventAttendees);
app.register(getAttendeeBadge);
app.register(checkIn);

app.setErrorHandler(errorHandler);

app.listen({ port: 3333, host: '0.0.0.0' }).then(() => console.log("🚀 HTTP Server running"));