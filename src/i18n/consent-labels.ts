import type { Locale } from "./config";

type ConsentLabels={title:string;description:string;accept:string;decline:string;privacyLink:string};
export const consentLabels:Record<Locale,ConsentLabels>={
 en:{title:"We use cookies to improve MyBetOracle",description:"We use analytics cookies to understand how the product is used and improve it. You can decline and still use every feature.",accept:"Accept",decline:"Decline",privacyLink:"Privacy Policy"},
 es:{title:"Usamos cookies para mejorar MyBetOracle",description:"Usamos cookies de analitica para entender como se usa el producto y mejorarlo. Puedes rechazar y seguir usando todas las funciones.",accept:"Aceptar",decline:"Rechazar",privacyLink:"Politica de Privacidad"},
 fr:{title:"Nous utilisons des cookies pour ameliorer MyBetOracle",description:"Nous utilisons des cookies analytiques pour comprendre l'utilisation du produit et l'ameliorer. Vous pouvez refuser et continuer a utiliser toutes les fonctionnalites.",accept:"Accepter",decline:"Refuser",privacyLink:"Politique de Confidentialite"},
 de:{title:"Wir verwenden Cookies, um MyBetOracle zu verbessern",description:"Wir verwenden Analyse-Cookies, um die Nutzung des Produkts zu verstehen und zu verbessern. Sie konnen ablehnen und weiterhin alle Funktionen nutzen.",accept:"Akzeptieren",decline:"Ablehnen",privacyLink:"Datenschutzerklarung"},
 it:{title:"Usiamo i cookie per migliorare MyBetOracle",description:"Utilizziamo cookie di analisi per capire come viene utilizzato il prodotto e migliorarlo. Puoi rifiutare e continuare a usare tutte le funzioni.",accept:"Accetta",decline:"Rifiuta",privacyLink:"Informativa sulla Privacy"},
 pt:{title:"Usamos cookies para melhorar o MyBetOracle",description:"Usamos cookies de analise para entender como o produto e usado e melhora-lo. Voce pode recusar e continuar usando todos os recursos.",accept:"Aceitar",decline:"Recusar",privacyLink:"Politica de Privacidade"}
};
