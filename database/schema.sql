-- ============================================================
-- LACANCHADEL10 — Script de creación de base de datos (SQL Server)
-- Ejecutar completo en SSMS sobre una instancia de SQL Server.
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'LaCanchaDel10')
BEGIN
    CREATE DATABASE LaCanchaDel10;
END
GO

USE LaCanchaDel10;
GO

-- USUARIO: clientes y propietarios
CREATE TABLE Usuario (
    IdUsuario     INT IDENTITY(1,1) PRIMARY KEY,
    Nombre        NVARCHAR(120)  NOT NULL,
    Correo        NVARCHAR(150)  NOT NULL,
    Contrasena    NVARCHAR(255)  NOT NULL,   -- hash BCrypt, nunca texto plano
    Telefono      NVARCHAR(20)   NULL,
    TipoUsuario   NVARCHAR(20)   NOT NULL CONSTRAINT DF_Usuario_TipoUsuario DEFAULT 'Cliente',
    FechaCreacion DATETIME2      NOT NULL CONSTRAINT DF_Usuario_FechaCreacion DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Usuario_Correo UNIQUE (Correo),
    CONSTRAINT CK_Usuario_TipoUsuario CHECK (TipoUsuario IN ('Cliente','Propietario'))
);
GO

-- ESTABLECIMIENTO: negocio que administra una o varias canchas
CREATE TABLE Establecimiento (
    IdEstablecimiento INT IDENTITY(1,1) PRIMARY KEY,
    Nombre            NVARCHAR(150) NOT NULL,
    Direccion         NVARCHAR(200) NOT NULL,
    Telefono          NVARCHAR(20)  NULL,
    Descripcion       NVARCHAR(500) NULL,
    IdPropietario     INT NOT NULL,
    CONSTRAINT FK_Establecimiento_Usuario FOREIGN KEY (IdPropietario)
        REFERENCES Usuario (IdUsuario) ON DELETE NO ACTION
);
GO

-- CANCHA: pertenece a un establecimiento
CREATE TABLE Cancha (
    IdCancha          INT IDENTITY(1,1) PRIMARY KEY,
    Nombre            NVARCHAR(120)  NOT NULL,
    Tipo              NVARCHAR(40)   NOT NULL,
    Precio            DECIMAL(10,2)  NOT NULL,
    Estado            NVARCHAR(20)   NOT NULL CONSTRAINT DF_Cancha_Estado DEFAULT 'Activa',
    IdEstablecimiento INT NOT NULL,
    CONSTRAINT FK_Cancha_Establecimiento FOREIGN KEY (IdEstablecimiento)
        REFERENCES Establecimiento (IdEstablecimiento) ON DELETE CASCADE,
    CONSTRAINT CK_Cancha_Estado CHECK (Estado IN ('Activa','Inactiva'))
);
GO

-- HORARIO: cupos publicados por el propietario para una cancha
CREATE TABLE Horario (
    IdHorario   INT IDENTITY(1,1) PRIMARY KEY,
    Fecha       DATE      NOT NULL,
    HoraInicio  TIME(0)   NOT NULL,
    HoraFin     TIME(0)   NOT NULL,
    Disponible  BIT       NOT NULL CONSTRAINT DF_Horario_Disponible DEFAULT 1,
    IdCancha    INT NOT NULL,
    CONSTRAINT FK_Horario_Cancha FOREIGN KEY (IdCancha)
        REFERENCES Cancha (IdCancha) ON DELETE CASCADE,
    CONSTRAINT CK_Horario_Horas CHECK (HoraFin > HoraInicio),
    CONSTRAINT UQ_Horario_CanchaFechaInicio UNIQUE (IdCancha, Fecha, HoraInicio)
);
GO

-- RESERVA: une a un usuario con el horario de una cancha
CREATE TABLE Reserva (
    IdReserva     INT IDENTITY(1,1) PRIMARY KEY,
    FechaReserva  DATETIME2      NOT NULL CONSTRAINT DF_Reserva_FechaReserva DEFAULT SYSUTCDATETIME(),
    Estado        NVARCHAR(20)   NOT NULL CONSTRAINT DF_Reserva_Estado DEFAULT 'Confirmada',
    Precio        DECIMAL(10,2)  NOT NULL,
    IdUsuario     INT NOT NULL,
    IdCancha      INT NOT NULL,
    IdHorario     INT NOT NULL,
    CONSTRAINT FK_Reserva_Usuario FOREIGN KEY (IdUsuario) REFERENCES Usuario (IdUsuario) ON DELETE NO ACTION,
    CONSTRAINT FK_Reserva_Cancha  FOREIGN KEY (IdCancha)  REFERENCES Cancha (IdCancha)   ON DELETE NO ACTION,
    CONSTRAINT FK_Reserva_Horario FOREIGN KEY (IdHorario) REFERENCES Horario (IdHorario) ON DELETE NO ACTION,
    CONSTRAINT CK_Reserva_Estado CHECK (Estado IN ('Pendiente','Confirmada','Cancelada','Completada'))
);
GO

-- Un horario solo puede tener UNA reserva activa (las canceladas no cuentan).
-- Es el candado de la base de datos contra dobles reservas.
CREATE UNIQUE INDEX UX_Reserva_Horario_Activa
    ON Reserva (IdHorario)
    WHERE Estado <> 'Cancelada';
GO

-- Índices de apoyo para las consultas más frecuentes
CREATE INDEX IX_Cancha_Establecimiento ON Cancha (IdEstablecimiento);
CREATE INDEX IX_Horario_Cancha_Fecha   ON Horario (IdCancha, Fecha);
CREATE INDEX IX_Reserva_Usuario        ON Reserva (IdUsuario);
CREATE INDEX IX_Reserva_Cancha         ON Reserva (IdCancha);
GO
