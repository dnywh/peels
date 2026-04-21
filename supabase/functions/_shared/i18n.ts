export type SupportedLocale = "en" | "es" | "de" | "pt-BR" | "fr";

export const defaultEmailLocale: SupportedLocale = "en";

const localeAliasMap: Record<string, SupportedLocale> = {
  en: "en",
  "en-au": "en",
  "en-gb": "en",
  "en-us": "en",
  es: "es",
  "es-419": "es",
  "es-ar": "es",
  "es-cl": "es",
  "es-co": "es",
  "es-es": "es",
  "es-mx": "es",
  de: "de",
  "de-at": "de",
  "de-ch": "de",
  "de-de": "de",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  "pt-pt": "pt-BR",
  fr: "fr",
  "fr-be": "fr",
  "fr-ca": "fr",
  "fr-fr": "fr",
};

export const resolveSupportedLocale = (
  value: string | null | undefined
): SupportedLocale | null => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const directMatch = localeAliasMap[trimmedValue];
  if (directMatch) {
    return directMatch;
  }

  const lowerCaseValue = trimmedValue.toLowerCase();
  const normalisedMatch = localeAliasMap[lowerCaseValue];
  if (normalisedMatch) {
    return normalisedMatch;
  }

  const [baseLanguage] = lowerCaseValue.split("-");
  return localeAliasMap[baseLanguage] ?? null;
};

export const getLocaleFromRedirectTo = (
  redirectTo: string | null | undefined
): SupportedLocale | null => {
  if (!redirectTo) {
    return null;
  }

  try {
    const redirectUrl = new URL(redirectTo);
    return resolveSupportedLocale(redirectUrl.searchParams.get("locale"));
  } catch (_error) {
    return null;
  }
};

export const resolveEmailLocale = ({
  redirectTo,
  preferredLocale,
}: {
  redirectTo?: string | null;
  preferredLocale?: string | null;
}): SupportedLocale =>
  getLocaleFromRedirectTo(redirectTo) ??
  resolveSupportedLocale(preferredLocale) ??
  defaultEmailLocale;

const authEmailCopy = {
  en: {
    signOff: "Best",
    team: "Peels team",
    replyHelp: "Just hit ‘reply’ if you run into any issues or have questions.",
    signup: {
      subject: "Verify your Peels account",
      preview:
        "Let's get you composting, {firstName}! Here’s a link to verify your Peels account.",
      heading: "Welcome to Peels",
      footer:
        "You’re receiving this email because you signed up for a Peels account.",
      body: "We’re so glad you’re here, {firstName}! Follow this link to verify your account:",
      button: "Verify your Peels account",
    },
    recovery: {
      subject: "Reset your password on Peels",
      preview:
        "Sorry to hear you’re having trouble signing in to Peels. Here’s a link to reset your password.",
      heading: "Reset your password",
      footer:
        "You’re receiving this email because someone—hopefully you—requested a password reset link for your Peels account.",
      body: "Sorry to hear you’re having trouble signing in to Peels. Tap the below link to reset your password:",
      button: "Reset password",
    },
    emailChange: {
      subject: "Confirm your email change on Peels",
      preview: "Here’s a link to change the email address you use on Peels.",
      heading: "Confirm your email change",
      footer:
        "You’re receiving this email because you requested an email address change on Peels.",
      body: "Follow this link to confirm your new email on Peels:",
      button: "Change email address",
      reminder: "As a reminder, you’re changing from {email} to {newEmail}.",
    },
    magicLink: {
      subject: "Your magic link for Peels",
      preview: "Here’s a link to instantly sign in to Peels.",
      heading: "Your magic link",
      footer:
        "You’re receiving this email because you requested help signing in to Peels.",
      body: "Follow this link to instantly sign in to Peels:",
      button: "Sign in to Peels",
    },
    invite: {
      subject: "You’ve been invited to Peels",
      preview: "Lucky you! You’re invited to try out Peels.",
      heading: "You’re invited",
      footer:
        "You’re receiving this email because someone at Peels invited you to join.",
      body: "Someone at Peels has invited you to try it out. Follow this link to accept the invite:",
      button: "Accept invite",
    },
    reauthentication: {
      subject: "Confirm reauthentication on Peels",
      genericSubject: "Your verification code for Peels",
      preview: "Here’s your code for Peels.",
      heading: "Your verification code",
      footer:
        "You’re receiving this email because you requested a verification code for Peels.",
      body: "Enter the following code on Peels:",
    },
  },
  es: {
    signOff: "Un abrazo",
    team: "Equipo de Peels",
    replyHelp:
      "Solo tienes que responder a este correo si tienes algún problema o pregunta.",
    signup: {
      subject: "Verifica tu cuenta de Peels",
      preview:
        "¡Vamos a ponerte a compostar, {firstName}! Aquí tienes un enlace para verificar tu cuenta de Peels.",
      heading: "Bienvenido a Peels",
      footer:
        "Recibes este correo porque te has registrado para crear una cuenta en Peels.",
      body: "Nos alegra mucho verte por aquí, {firstName}! Sigue este enlace para verificar tu cuenta:",
      button: "Verificar tu cuenta de Peels",
    },
    recovery: {
      subject: "Restablece tu contraseña de Peels",
      preview:
        "Sentimos que estés teniendo problemas para iniciar sesión en Peels. Aquí tienes un enlace para restablecer tu contraseña.",
      heading: "Restablece tu contraseña",
      footer:
        "Recibes este correo porque alguien, esperamos que hayas sido tú, solicitó un enlace para restablecer la contraseña de tu cuenta de Peels.",
      body: "Sentimos que estés teniendo problemas para iniciar sesión en Peels. Toca el siguiente enlace para restablecer tu contraseña:",
      button: "Restablecer contraseña",
    },
    emailChange: {
      subject: "Confirma tu cambio de correo en Peels",
      preview:
        "Aquí tienes un enlace para cambiar la dirección de correo que usas en Peels.",
      heading: "Confirma tu cambio de correo",
      footer:
        "Recibes este correo porque solicitaste cambiar tu dirección de correo en Peels.",
      body: "Sigue este enlace para confirmar tu nuevo correo en Peels:",
      button: "Cambiar dirección de correo",
      reminder: "Como recordatorio, estás cambiando de {email} a {newEmail}.",
    },
    magicLink: {
      subject: "Tu enlace mágico para Peels",
      preview:
        "Aquí tienes un enlace para iniciar sesión en Peels al instante.",
      heading: "Tu enlace mágico",
      footer:
        "Recibes este correo porque pediste ayuda para iniciar sesión en Peels.",
      body: "Sigue este enlace para iniciar sesión en Peels al instante:",
      button: "Iniciar sesión en Peels",
    },
    invite: {
      subject: "Te han invitado a Peels",
      preview: "¡Qué suerte! Te han invitado a probar Peels.",
      heading: "Tienes una invitación",
      footer: "Recibes este correo porque alguien de Peels te invitó a unirte.",
      body: "Alguien de Peels te ha invitado a probarlo. Sigue este enlace para aceptar la invitación:",
      button: "Aceptar invitación",
    },
    reauthentication: {
      subject: "Confirma la reautenticación en Peels",
      genericSubject: "Tu código de verificación para Peels",
      preview: "Aquí tienes tu código para Peels.",
      heading: "Tu código de verificación",
      footer:
        "Recibes este correo porque solicitaste un código de verificación para Peels.",
      body: "Introduce el siguiente código en Peels:",
    },
  },
  de: {
    signOff: "Viele Grüsse",
    team: "Peels-Team",
    replyHelp:
      "Antworte einfach auf diese E-Mail, wenn du auf Probleme stösst oder Fragen hast.",
    signup: {
      subject: "Bestätige dein Peels-Konto",
      preview:
        "Los geht’s mit dem Kompostieren, {firstName}! Hier ist dein Link, um dein Peels-Konto zu bestätigen.",
      heading: "Willkommen bei Peels",
      footer:
        "Du erhältst diese E-Mail, weil du ein Peels-Konto erstellt hast.",
      body: "Schön, dass du da bist, {firstName}! Folge diesem Link, um dein Konto zu bestätigen:",
      button: "Peels-Konto bestätigen",
    },
    recovery: {
      subject: "Setze dein Peels-Passwort zurück",
      preview:
        "Schade, dass du Probleme beim Anmelden bei Peels hast. Hier ist ein Link, um dein Passwort zurückzusetzen.",
      heading: "Setze dein Passwort zurück",
      footer:
        "Du erhältst diese E-Mail, weil jemand – hoffentlich du – einen Link zum Zurücksetzen des Passworts für dein Peels-Konto angefordert hat.",
      body: "Schade, dass du Probleme beim Anmelden bei Peels hast. Nutze den folgenden Link, um dein Passwort zurückzusetzen:",
      button: "Passwort zurücksetzen",
    },
    emailChange: {
      subject: "Bestätige deine E-Mail-Änderung bei Peels",
      preview:
        "Hier ist ein Link, um die E-Mail-Adresse zu ändern, die du bei Peels verwendest.",
      heading: "Bestätige deine E-Mail-Änderung",
      footer:
        "Du erhältst diese E-Mail, weil du eine Änderung deiner E-Mail-Adresse bei Peels angefordert hast.",
      body: "Folge diesem Link, um deine neue E-Mail-Adresse bei Peels zu bestätigen:",
      button: "E-Mail-Adresse ändern",
      reminder: "Zur Erinnerung: Du wechselst von {email} zu {newEmail}.",
    },
    magicLink: {
      subject: "Dein Magic Link für Peels",
      preview:
        "Hier ist ein Link, mit dem du dich sofort bei Peels anmelden kannst.",
      heading: "Dein Magic Link",
      footer:
        "Du erhältst diese E-Mail, weil du Hilfe beim Anmelden bei Peels angefordert hast.",
      body: "Folge diesem Link, um dich sofort bei Peels anzumelden:",
      button: "Bei Peels anmelden",
    },
    invite: {
      subject: "Du wurdest zu Peels eingeladen",
      preview: "Glück gehabt! Du wurdest eingeladen, Peels auszuprobieren.",
      heading: "Du bist eingeladen",
      footer:
        "Du erhältst diese E-Mail, weil dich jemand von Peels zum Mitmachen eingeladen hat.",
      body: "Jemand von Peels hat dich eingeladen, es auszuprobieren. Folge diesem Link, um die Einladung anzunehmen:",
      button: "Einladung annehmen",
    },
    reauthentication: {
      subject: "Bestätige die erneute Anmeldung bei Peels",
      genericSubject: "Dein Bestätigungscode für Peels",
      preview: "Hier ist dein Code für Peels.",
      heading: "Dein Bestätigungscode",
      footer:
        "Du erhältst diese E-Mail, weil du einen Bestätigungscode für Peels angefordert hast.",
      body: "Gib den folgenden Code bei Peels ein:",
    },
  },
  "pt-BR": {
    signOff: "Abraço",
    team: "Equipa do Peels",
    replyHelp:
      "É só responder a este e-mail se tiveres algum problema ou pergunta.",
    signup: {
      subject: "Confirma a tua conta no Peels",
      preview:
        "Vamos colocar-te a compostar, {firstName}! Aqui está um link para confirmares a tua conta no Peels.",
      heading: "Boas-vindas ao Peels",
      footer: "Recebeste este e-mail porque criaste uma conta no Peels.",
      body: "Que bom ter-te por aqui, {firstName}! Segue este link para confirmares a tua conta:",
      button: "Confirmar a tua conta no Peels",
    },
    recovery: {
      subject: "Redefine a tua palavra-passe no Peels",
      preview:
        "Lamentamos que estejas com dificuldades para entrar no Peels. Aqui está um link para redefinires a tua palavra-passe.",
      heading: "Redefine a tua palavra-passe",
      footer:
        "Recebeste este e-mail porque alguém, esperamos que tenhas sido tu, pediu um link para redefinir a palavra-passe da tua conta no Peels.",
      body: "Lamentamos que estejas com dificuldades para entrar no Peels. Toca no link abaixo para redefinires a tua palavra-passe:",
      button: "Redefinir palavra-passe",
    },
    emailChange: {
      subject: "Confirma a alteração do teu e-mail no Peels",
      preview:
        "Aqui está um link para alterares o endereço de e-mail que usas no Peels.",
      heading: "Confirma a alteração do teu e-mail",
      footer:
        "Recebeste este e-mail porque pediste uma alteração de endereço de e-mail no Peels.",
      body: "Segue este link para confirmares o teu novo e-mail no Peels:",
      button: "Alterar endereço de e-mail",
      reminder: "Só para relembrar: estás a mudar de {email} para {newEmail}.",
    },
    magicLink: {
      subject: "O teu link mágico para o Peels",
      preview: "Aqui está um link para entrares instantaneamente no Peels.",
      heading: "O teu link mágico",
      footer:
        "Recebeste este e-mail porque pediste ajuda para entrar no Peels.",
      body: "Segue este link para entrares instantaneamente no Peels:",
      button: "Entrar no Peels",
    },
    invite: {
      subject: "Foste convidado para o Peels",
      preview: "Que sorte! Foste convidado para experimentar o Peels.",
      heading: "Tens um convite",
      footer:
        "Recebeste este e-mail porque alguém do Peels te convidou para participar.",
      body: "Alguém do Peels convidou-te para experimentar a plataforma. Segue este link para aceitares o convite:",
      button: "Aceitar convite",
    },
    reauthentication: {
      subject: "Confirma a reautenticação no Peels",
      genericSubject: "O teu código de verificação para o Peels",
      preview: "Aqui está o teu código para o Peels.",
      heading: "O teu código de verificação",
      footer:
        "Recebeste este e-mail porque pediste um código de verificação para o Peels.",
      body: "Introduz o código abaixo no Peels:",
    },
  },
  fr: {
    signOff: "Bien à vous",
    team: "Équipe Peels",
    replyHelp:
      "Répondez simplement à cet e-mail si vous rencontrez un souci ou si vous avez des questions.",
    signup: {
      subject: "Vérifiez votre compte Peels",
      preview:
        "On vous aide à vous lancer dans le compostage, {firstName} ! Voici un lien pour vérifier votre compte Peels.",
      heading: "Bienvenue sur Peels",
      footer:
        "Vous recevez cet e-mail parce que vous avez créé un compte Peels.",
      body: "Nous sommes ravis de vous compter parmi nous, {firstName} ! Suivez ce lien pour vérifier votre compte :",
      button: "Vérifier votre compte Peels",
    },
    recovery: {
      subject: "Réinitialisez votre mot de passe Peels",
      preview:
        "Désolé d’apprendre que vous avez du mal à vous connecter à Peels. Voici un lien pour réinitialiser votre mot de passe.",
      heading: "Réinitialisez votre mot de passe",
      footer:
        "Vous recevez cet e-mail parce que quelqu’un, espérons-le vous, a demandé un lien de réinitialisation du mot de passe pour votre compte Peels.",
      body: "Désolé d’apprendre que vous avez du mal à vous connecter à Peels. Appuyez sur le lien ci-dessous pour réinitialiser votre mot de passe :",
      button: "Réinitialiser le mot de passe",
    },
    emailChange: {
      subject: "Confirmez votre changement d’e-mail sur Peels",
      preview:
        "Voici un lien pour changer l’adresse e-mail que vous utilisez sur Peels.",
      heading: "Confirmez votre changement d’e-mail",
      footer:
        "Vous recevez cet e-mail parce que vous avez demandé un changement d’adresse e-mail sur Peels.",
      body: "Suivez ce lien pour confirmer votre nouvelle adresse e-mail sur Peels :",
      button: "Changer d’adresse e-mail",
      reminder: "Pour rappel, vous passez de {email} à {newEmail}.",
    },
    magicLink: {
      subject: "Votre lien magique pour Peels",
      preview: "Voici un lien pour vous connecter instantanément à Peels.",
      heading: "Votre lien magique",
      footer:
        "Vous recevez cet e-mail parce que vous avez demandé de l’aide pour vous connecter à Peels.",
      body: "Suivez ce lien pour vous connecter instantanément à Peels :",
      button: "Se connecter à Peels",
    },
    invite: {
      subject: "Vous êtes invité sur Peels",
      preview: "Quelle chance ! Vous êtes invité à découvrir Peels.",
      heading: "Vous êtes invité",
      footer:
        "Vous recevez cet e-mail parce qu’une personne de Peels vous a invité à rejoindre la plateforme.",
      body: "Une personne de Peels vous a invité à découvrir la plateforme. Suivez ce lien pour accepter l’invitation :",
      button: "Accepter l’invitation",
    },
    reauthentication: {
      subject: "Confirmez la réauthentification sur Peels",
      genericSubject: "Votre code de vérification pour Peels",
      preview: "Voici votre code pour Peels.",
      heading: "Votre code de vérification",
      footer:
        "Vous recevez cet e-mail parce que vous avez demandé un code de vérification pour Peels.",
      body: "Saisissez le code suivant sur Peels :",
    },
  },
} as const satisfies Record<SupportedLocale, unknown>;

type AuthEmailKind =
  | "signup"
  | "recovery"
  | "emailChange"
  | "magicLink"
  | "invite"
  | "reauthentication";

export const getAuthEmailCopy = (
  locale: SupportedLocale,
  kind: AuthEmailKind
) => authEmailCopy[locale][kind];

export const getAuthEmailSharedCopy = (locale: SupportedLocale) => ({
  signOff: authEmailCopy[locale].signOff,
  team: authEmailCopy[locale].team,
  replyHelp: authEmailCopy[locale].replyHelp,
});

const chatEmailCopy = {
  en: {
    subject: "{senderName} just messaged you",
    preview:
      "Hi {recipientName}, you’ve received a new message from {senderName}. Visit Peels to see what they wrote.",
    heading: "New message on Peels",
    ownerFooterBeforeLink: "Don’t want emails like this? ",
    ownerFooterLink: "Manage",
    ownerFooterAfterLink: " your listing to hide or remove it from Peels.",
    initiatorFooterBeforeLink:
      "You’re receiving this email because you originally reached out to {senderName} on ",
    initiatorFooterLink: "Peels",
    initiatorFooterAfterLink: ".",
    residentOf: "Resident of {listingAreaName}",
    body: "Hi {recipientName}, you’ve received a new message from {senderName}{listingContext}. Check it out on Peels:",
    button: "View message",
    signOff: "Best",
    team: "Peels team",
  },
  es: {
    subject: "{senderName} te ha enviado un mensaje",
    preview:
      "Hola {recipientName}, has recibido un nuevo mensaje de {senderName}. Visita Peels para ver lo que escribió.",
    heading: "Nuevo mensaje en Peels",
    ownerFooterBeforeLink: "¿No quieres recibir correos como este? ",
    ownerFooterLink: "Gestiona",
    ownerFooterAfterLink: " tu anuncio para ocultarlo o quitarlo de Peels.",
    initiatorFooterBeforeLink:
      "Recibes este correo porque contactaste antes con {senderName} en ",
    initiatorFooterLink: "Peels",
    initiatorFooterAfterLink: ".",
    residentOf: "Persona residente de {listingAreaName}",
    body: "Hola {recipientName}, has recibido un nuevo mensaje de {senderName}{listingContext}. Échale un vistazo en Peels:",
    button: "Ver mensaje",
    signOff: "Un abrazo",
    team: "Equipo de Peels",
  },
  de: {
    subject: "{senderName} hat dir gerade geschrieben",
    preview:
      "Hallo {recipientName}, du hast eine neue Nachricht von {senderName} erhalten. Besuche Peels, um sie zu lesen.",
    heading: "Neue Nachricht auf Peels",
    ownerFooterBeforeLink: "Du möchtest solche E-Mails nicht mehr? ",
    ownerFooterLink: "Verwalte",
    ownerFooterAfterLink:
      " deinen Eintrag, um ihn auf Peels auszublenden oder zu entfernen.",
    initiatorFooterBeforeLink:
      "Du erhältst diese E-Mail, weil du {senderName} ursprünglich über ",
    initiatorFooterLink: "Peels",
    initiatorFooterAfterLink: " kontaktiert hast.",
    residentOf: "Person aus {listingAreaName}",
    body: "Hallo {recipientName}, du hast eine neue Nachricht von {senderName}{listingContext} erhalten. Schau sie dir auf Peels an:",
    button: "Nachricht ansehen",
    signOff: "Viele Grüsse",
    team: "Peels-Team",
  },
  "pt-BR": {
    subject: "{senderName} acabou de te enviar uma mensagem",
    preview:
      "Olá {recipientName}, recebeste uma nova mensagem de {senderName}. Vai ao Peels para ver o que foi escrito.",
    heading: "Nova mensagem no Peels",
    ownerFooterBeforeLink: "Não queres receber e-mails como este? ",
    ownerFooterLink: "Gere",
    ownerFooterAfterLink:
      " o teu anúncio para o ocultares ou removeres do Peels.",
    initiatorFooterBeforeLink:
      "Recebeste este e-mail porque entraste em contacto com {senderName} no ",
    initiatorFooterLink: "Peels",
    initiatorFooterAfterLink: ".",
    residentOf: "Pessoa de {listingAreaName}",
    body: "Olá {recipientName}, recebeste uma nova mensagem de {senderName}{listingContext}. Vê tudo no Peels:",
    button: "Ver mensagem",
    signOff: "Abraço",
    team: "Equipa do Peels",
  },
  fr: {
    subject: "{senderName} vient de vous envoyer un message",
    preview:
      "Bonjour {recipientName}, vous avez reçu un nouveau message de {senderName}. Rendez-vous sur Peels pour le lire.",
    heading: "Nouveau message sur Peels",
    ownerFooterBeforeLink:
      "Vous ne souhaitez plus recevoir ce type d’e-mails ? ",
    ownerFooterLink: "Gérez",
    ownerFooterAfterLink:
      " votre annonce pour la masquer ou la supprimer de Peels.",
    initiatorFooterBeforeLink:
      "Vous recevez cet e-mail parce que vous avez contacté {senderName} via ",
    initiatorFooterLink: "Peels",
    initiatorFooterAfterLink: ".",
    residentOf: "Personne située à {listingAreaName}",
    body: "Bonjour {recipientName}, vous avez reçu un nouveau message de {senderName}{listingContext}. Consultez-le sur Peels :",
    button: "Voir le message",
    signOff: "Bien à vous",
    team: "Équipe Peels",
  },
} as const satisfies Record<SupportedLocale, unknown>;

export const getChatEmailCopy = (locale: SupportedLocale) =>
  chatEmailCopy[locale];
