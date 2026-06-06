import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    es: {
      translation: {
        finalizar_reserva: "FINALIZAR RESERVA",
        volver: "VOLVER",
        datos_personales: "DATOS PERSONALES",
        datos_viaje: "DATOS DEL VIAJE",
        nombre: "Nombre completo",
        email: "Correo electrónico",
        telefono: "Teléfono",
        nacionalidad: "Nacionalidad",
        pasaporte: "Pasaporte / DNI",
        salud: "Condiciones médicas",
        confirmar: "CONFIRMAR RESERVA",
        resumen: "RESUMEN",
        tour: "Tour",
        personas: "Personas",
        precio: "Precio",
        reserva_exitosa: "Reserva realizada correctamente",
        tour_default: "Tour Personalizado"
      }
    },
    en: {
      translation: {
        finalizar_reserva: "CHECKOUT",
        volver: "BACK",
        datos_personales: "PERSONAL INFO",
        datos_viaje: "TRIP DETAILS",
        nombre: "Full name",
        email: "Email",
        telefono: "Phone",
        nacionalidad: "Nationality",
        pasaporte: "Passport / ID",
        salud: "Medical conditions",
        confirmar: "CONFIRM BOOKING",
        resumen: "SUMMARY",
        tour: "Tour",
        personas: "People",
        precio: "Price",
        reserva_exitosa: "Booking completed",
        tour_default: "Custom Tour"
      }
    }
  },
  lng: "es",
  fallbackLng: "es",
  interpolation: { escapeValue: false }
});

export default i18n;