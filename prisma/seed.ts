import { db } from '../src/lib/db';

async function seed() {
    await db.event.create({
        data: {
            id: '5eefcdcd-ddec-4043-9058-2e01de089e30',
            title: "Unite Summit",
            slug: "unite-summit",
            details: "Evento para devs",
            maximumAttendees: 120,
        }
    })
}

seed().then(() => {
    console.log('Database seeded.');
    db.$disconnect();
})