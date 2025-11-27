
if (!file) {
    return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
    );
}

// Validar tipo de archivo
const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!validTypes.includes(file.type)) {
    return NextResponse.json(
        { error: 'Tipo de archivo no válido. Use JPG, PNG o WebP' },
        { status: 400 }
    );
}

// Validar tamaño de archivo (5MB max)
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
    return NextResponse.json(
        { error: 'El archivo es demasiado grande. Máximo 5MB' },
        { status: 400 }
    );
}

// Convertir archivo a base64 para Cloudinary
const bytes = await file.arrayBuffer();
const buffer = Buffer.from(bytes);
const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

// Subir a Cloudinary
const result = await uploadImage(base64, 'products');

return NextResponse.json({
    url: result.url,
    publicId: result.publicId
});

    } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
        { error: 'Error al subir la imagen' },
        { status: 500 }
    );
}
}
