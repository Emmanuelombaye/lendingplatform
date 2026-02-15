import prisma from '../src/utils/prisma';
import bcrypt from 'bcrypt';

async function seed() {
    console.log('🌱 Seeding database...');

    const email = 'vertex@loans.com';
    const password = '@Kenya90!132323';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existingAdmin = await prisma.user.findUnique({ where: { email } });

    if (existingAdmin) {
        await prisma.user.update({
            where: { email },
            data: { passwordHash, role: 'ADMIN', fullName: 'Vertex Admin' }
        });
        console.log('✅ Admin user updated');
    } else {
        await prisma.user.create({
            data: {
                fullName: 'Vertex Admin',
                email,
                passwordHash,
                role: 'ADMIN'
            }
        });
        console.log('✅ Admin user created');
    }

    // Seed default settings if not exist
    const settings = await prisma.settings.findFirst();
    if (!settings) {
        await prisma.settings.create({ data: {} });
        console.log('✅ Default settings created');
    }

    console.log('🎉 Seeding complete!');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);

    await prisma.$disconnect();
}

seed().catch((e) => {
    console.error('❌ Seed failed:', e);
    prisma.$disconnect();
    process.exit(1);
});
