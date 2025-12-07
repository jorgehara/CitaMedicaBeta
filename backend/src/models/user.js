const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Por favor ingrese un email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No incluir password en queries por defecto
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'operador', 'auditor'],
            message: '{VALUE} no es un rol válido'
        },
        default: 'operador',
        required: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware pre-save: Hashear password antes de guardar
userSchema.pre('save', async function(next) {
    // Solo hashear si el password fue modificado (o es nuevo)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generar salt y hashear password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método de instancia: Comparar password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error al comparar contraseñas');
    }
};

// Método de instancia: Convertir a JSON sin password
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

// Índice para mejorar performance en búsquedas por email
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
