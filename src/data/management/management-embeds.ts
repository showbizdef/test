import { COMPANY_DEPUTY_DIRECTOR_ROLE_ID, COMPANY_DIRECTOR_ROLE_ID, COMPANY_OWNER_ROLE_ID } from "@constants/roles";

export const INTRODUCTION_EMBED_TITLE: string = "📒 Общее положение";
export const INTRODUCTION_EMBED_DESCRIPTION: string = `К руководящему составу нашей компании относятся: владельцы компании (<@&${COMPANY_OWNER_ROLE_ID}>), директор компании (<@&${COMPANY_DIRECTOR_ROLE_ID}>) и его полноправные заместители (<@&${COMPANY_DEPUTY_DIRECTOR_ROLE_ID}>).`;

export const OWNERS_EMBED_TITLE: string = "🧸 Владельцы компании";
export const OWNERS_EMBED_DESCRIPTION: string =
  "Полномочия владельцев компании в пределах ее юридической сферы являются неограниченными. Эти полномочия включают в себя возможность назначения и утверждения кандидатур на должность директора и его заместителей, а также осуществление общего контроля над функционированием компании.";

export const MANAGEMENT_EMBED_TITLE: string = "🌟 Директор и его заместители";
