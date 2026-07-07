import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding products...');
  
  // Borrar productos existentes
  await prisma.product.deleteMany({});
  
  const products = [
    {
      name: 'Dragón articulado',
      description: 'Un espectacular dragón impreso en 3D con articulaciones totalmente móviles. Ideal como juguete antiestrés o decoración para tu escritorio. Impreso en plástico PLA biodegradable de alta calidad.',
      price: 15000,
      discount: 10, // 10% de descuento
      stock: 10,
      category: 'Articulados',
      imageUrl: 'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Maceta geométrica',
      description: 'Maceta de diseño geométrico minimalista, ideal para suculentas o plantas pequeñas. Aporta un toque moderno y elegante a cualquier espacio interior.',
      price: 8000,
      discount: 0,
      stock: 15,
      category: 'Decoración',
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Llavero personalizado',
      description: 'Llavero impreso en 3D. Personalízalo con tu nombre o palabra favorita. Resistente y ligero, ideal para regalar.',
      price: 3000,
      discount: 0,
      stock: 50,
      category: 'Accesorios',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Miniatura de D&D',
      description: 'Miniatura detallada de alta resolución para juegos de rol de mesa. Altura de 32mm, perfecta para representar héroes o monstruos en tus campañas.',
      price: 5000,
      discount: 15, // 15% de descuento
      stock: 20,
      category: 'Juegos de Rol',
      imageUrl: 'https://images.unsplash.com/photo-1608889174637-3c44f6326f1c?q=80&w=600&auto=format&fit=crop',
    },
    {
      name: 'Soporte para auriculares',
      description: 'Soporte de diseño ergonómico para colocar tus auriculares en el escritorio de forma segura. Base antideslizante y canal integrado para organizar cables.',
      price: 12000,
      discount: 5, // 5% de descuento
      stock: 8,
      category: 'Accesorios',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop',
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`Product created: ${created.name} (${created.id})`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
