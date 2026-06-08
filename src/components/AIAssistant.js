import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useTranslation } from 'react-i18next';
import './AIAssistant.css';

// ═══════════════════════════════════════════════
//  BASE DE CONNAISSANCES — ARTISAN
// ═══════════════════════════════════════════════
const knowledgeArtisan = [
  {
    id: 'postuler',
    keywords: ['postuler', 'candidature', 'candidater', 'envoyer', 'offre', 'emploi', 'travail', 'job', 'apply'],
    question: 'Comment postuler à une offre ?',
    answer:
      'Pour postuler à une offre, suivez ces étapes :\n\n' +
      '1️⃣ Allez dans la section **« Offres »** depuis le menu.\n' +
      '2️⃣ Parcourez les offres disponibles et cliquez sur celle qui vous intéresse.\n' +
      '3️⃣ Lisez attentivement la description du poste.\n' +
      '4️⃣ Cliquez sur le bouton **« Postuler »**.\n' +
      '5️⃣ Rédigez votre **motivation** et indiquez vos **années d\'expérience**.\n' +
      '6️⃣ Validez votre candidature.\n\n' +
      '✅ Votre candidature sera envoyée directement au recruteur !',
    actions: [{ label: 'Voir les offres', path: '/offres' }],
  },
  {
    id: 'creer-compte',
    keywords: ['créer', 'creer', 'compte', 'inscription', 'inscrire', 'register', 'nouveau', 'rejoindre'],
    question: 'Comment créer un compte ?',
    answer:
      'Pour créer votre compte artisan :\n\n' +
      '1️⃣ Cliquez sur **« Inscription »** en haut de la page.\n' +
      '2️⃣ Choisissez le rôle **« Artisan »**.\n' +
      '3️⃣ Sélectionnez votre **spécialité** (plomberie, électricité, menuiserie…).\n' +
      '4️⃣ Remplissez vos informations personnelles.\n' +
      '5️⃣ Créez un mot de passe sécurisé (minimum 6 caractères).\n' +
      '6️⃣ Validez et vous êtes prêt !\n\n' +
      '💡 Pensez à compléter votre profil après l\'inscription pour attirer plus de recruteurs.',
    actions: [{ label: 'S\'inscrire maintenant', path: '/register' }],
  },
  {
    id: 'modifier-profil',
    keywords: ['profil', 'modifier', 'changer', 'mettre à jour', 'photo', 'information', 'compléter', 'completer', 'éditer', 'editer', 'cv'],
    question: 'Comment compléter mon profil ?',
    answer:
      'Pour compléter ou modifier votre profil :\n\n' +
      '1️⃣ Cliquez sur **votre avatar** ou nom en haut à droite.\n' +
      '2️⃣ Accédez à votre page de profil.\n' +
      '3️⃣ Cliquez sur **« Modifier »**.\n' +
      '4️⃣ Mettez à jour vos informations :\n' +
      '   • Spécialité\n' +
      '   • Ville et localisation\n' +
      '   • Numéro de téléphone\n' +
      '   • Description et expérience\n' +
      '   • Photo de profil\n' +
      '5️⃣ Enregistrez les modifications.\n\n' +
      '⭐ Un profil complet augmente vos chances d\'être contacté par un recruteur !',
    actions: [{ label: 'Modifier mon profil', path: '/profil/edit' }],
  },
  {
    id: 'mot-de-passe',
    keywords: ['mot de passe', 'password', 'oublié', 'oublie', 'réinitialiser', 'reinitialiser', 'reset', 'changer mot', 'mdp', 'connexion impossible'],
    question: 'Comment modifier mon mot de passe ?',
    answer:
      'Pour réinitialiser votre mot de passe :\n\n' +
      '1️⃣ Allez sur la page de **connexion**.\n' +
      '2️⃣ Cliquez sur **« Mot de passe oublié ? »**.\n' +
      '3️⃣ Entrez votre **adresse email**.\n' +
      '4️⃣ Consultez votre boîte mail (vérifiez aussi les spams).\n' +
      '5️⃣ Cliquez sur le **lien de réinitialisation** reçu.\n' +
      '6️⃣ Choisissez un **nouveau mot de passe** sécurisé.\n\n' +
      '🔒 Utilisez au moins 6 caractères avec des lettres et chiffres.',
    actions: [{ label: 'Réinitialiser le mot de passe', path: '/forgot-password' }],
  },
  {
    id: 'candidature-refusee',
    keywords: ['refusé', 'refuse', 'refusée', 'rejeté', 'rejetée', 'rejet', 'pourquoi', 'pas accepté', 'pas retenu', 'echec', 'échoué'],
    question: 'Pourquoi ma candidature a été refusée ?',
    answer:
      'Il existe plusieurs raisons pour lesquelles une candidature peut être refusée :\n\n' +
      '• ❌ Le profil ne correspond pas aux **exigences du poste**.\n' +
      '• ❌ La **motivation** n\'était pas assez détaillée.\n' +
      '• ❌ L\'**expérience** demandée ne correspond pas.\n' +
      '• ❌ Le recruteur a trouvé un **candidat plus adapté**.\n' +
      '• ❌ L\'offre a été **pourvue** avant l\'examen de votre dossier.\n\n' +
      '💪 Ne vous découragez pas ! Continuez à postuler et pensez à enrichir votre profil et votre portfolio.',
    actions: [
      { label: 'Voir mes candidatures', path: '/candidatures' },
      { label: 'Améliorer mon profil', path: '/profil/edit' },
    ],
  },
  {
    id: 'suivre-candidatures',
    keywords: ['suivre', 'suivi', 'status', 'statut', 'état', 'etat', 'mes candidatures', 'en attente', 'accepté', 'accepte'],
    question: 'Comment suivre mes candidatures ?',
    answer:
      'Pour suivre l\'état de vos candidatures :\n\n' +
      '1️⃣ Cliquez sur **« Candidatures »** dans le menu.\n' +
      '2️⃣ Vous verrez la liste de toutes vos candidatures envoyées.\n' +
      '3️⃣ Chaque candidature affiche son **statut** :\n' +
      '   • 🟡 **En attente** : le recruteur n\'a pas encore répondu.\n' +
      '   • ✅ **Acceptée** : félicitations, vous avez été retenu !\n' +
      '   • ❌ **Refusée** : le recruteur a choisi un autre profil.\n\n' +
      '📬 Consultez régulièrement vos messages pour ne manquer aucune réponse.',
    actions: [{ label: 'Mes candidatures', path: '/candidatures' }],
  },
  {
    id: 'connexion',
    keywords: ['connexion', 'connecter', 'login', 'se connecter', 'accéder', 'entrer', 'problème connexion', 'bug', 'erreur'],
    question: 'Problème de connexion ?',
    answer:
      'Si vous avez des problèmes de connexion, essayez ces solutions :\n\n' +
      '1️⃣ Vérifiez que votre **email** est correct.\n' +
      '2️⃣ Vérifiez que le **mot de passe** est bon (attention aux majuscules).\n' +
      '3️⃣ Si vous avez oublié votre mot de passe, cliquez sur **« Mot de passe oublié ? »**.\n' +
      '4️⃣ Essayez de **vider le cache** de votre navigateur.\n' +
      '5️⃣ Essayez un **autre navigateur** (Chrome, Firefox, Edge).\n\n' +
      '⚠️ Si le problème persiste, contactez le support : candidat@plateforme.com',
    actions: [{ label: 'Se connecter', path: '/login' }],
  },
  {
    id: 'portfolio',
    keywords: ['portfolio', 'photos', 'travaux', 'réalisations', 'galerie', 'images', 'projets'],
    question: 'Comment gérer mon portfolio ?',
    answer:
      'Votre portfolio est votre vitrine professionnelle :\n\n' +
      '1️⃣ Allez dans **« Portfolio »** depuis le menu.\n' +
      '2️⃣ Cliquez sur **« Ajouter »** pour uploader des photos de vos réalisations.\n' +
      '3️⃣ Ajoutez une **description** pour chaque projet.\n' +
      '4️⃣ Les recruteurs pourront voir vos travaux directement.\n\n' +
      '📸 Un portfolio riche avec de belles photos augmente considérablement vos chances !',
    actions: [{ label: 'Mon portfolio', path: '/portfolio' }],
  },
  {
    id: 'messages',
    keywords: ['message', 'messages', 'contacter', 'discussion', 'chat', 'communication', 'écrire', 'ecrire', 'répondre'],
    question: 'Comment utiliser la messagerie ?',
    answer:
      'La messagerie vous permet de communiquer avec les recruteurs :\n\n' +
      '1️⃣ Cliquez sur l\'icône **Messages** dans la barre de navigation.\n' +
      '2️⃣ Vous verrez vos **conversations** existantes.\n' +
      '3️⃣ Cliquez sur une conversation pour lire et **répondre**.\n' +
      '4️⃣ Les recruteurs peuvent aussi vous contacter directement.\n\n' +
      '💬 Répondez rapidement pour montrer votre motivation !',
    actions: [{ label: 'Mes messages', path: '/messages' }],
  },
];

// ═══════════════════════════════════════════════
//  BASE DE CONNAISSANCES — RECRUTEUR
// ═══════════════════════════════════════════════
const knowledgeRecruteur = [
  {
    id: 'publier-offre',
    keywords: ['publier', 'créer offre', 'creer offre', 'nouvelle offre', 'poster', 'ajouter offre', 'offre emploi', 'job', 'annonce'],
    question: 'Comment publier une offre d\'emploi ?',
    answer:
      'Pour publier une offre d\'emploi :\n\n' +
      '1️⃣ Cliquez sur **« Publier »** dans le menu de navigation.\n' +
      '2️⃣ Remplissez les informations de l\'offre :\n' +
      '   • **Domaine / Spécialité** recherchée\n' +
      '   • **Description** détaillée du poste\n' +
      '   • **Salaire** proposé\n' +
      '   • **Adresse** et localisation sur la carte\n' +
      '3️⃣ Cliquez sur **« Publier l\'offre »**.\n\n' +
      '🎯 Les artisans correspondants verront votre offre immédiatement !',
    actions: [{ label: 'Publier une offre', path: '/offres/new' }],
  },
  {
    id: 'creer-compte-recruteur',
    keywords: ['créer', 'creer', 'compte', 'inscription', 'inscrire', 'register', 'nouveau', 'rejoindre'],
    question: 'Comment créer un compte recruteur ?',
    answer:
      'Pour créer votre compte recruteur :\n\n' +
      '1️⃣ Cliquez sur **« Inscription »** en haut de la page.\n' +
      '2️⃣ Choisissez le rôle **« Recruteur »**.\n' +
      '3️⃣ Renseignez le **nom de votre entreprise**.\n' +
      '4️⃣ Sélectionnez votre **secteur d\'activité**.\n' +
      '5️⃣ Remplissez vos informations et créez un mot de passe.\n' +
      '6️⃣ Validez votre inscription !\n\n' +
      '🏢 Complétez votre profil entreprise pour inspirer confiance aux candidats.',
    actions: [{ label: 'S\'inscrire', path: '/register' }],
  },
  {
    id: 'voir-candidatures',
    keywords: ['candidature', 'candidatures reçues', 'candidats', 'postulants', 'qui a postulé', 'voir candidats', 'consulter'],
    question: 'Comment consulter les candidatures reçues ?',
    answer:
      'Pour voir les candidatures reçues sur vos offres :\n\n' +
      '1️⃣ Accédez à **« Candidatures »** dans le menu.\n' +
      '2️⃣ Vous verrez la liste de **toutes les candidatures** organisées par offre.\n' +
      '3️⃣ Chaque candidature affiche :\n' +
      '   • Le **nom** du candidat\n' +
      '   • Sa **motivation**\n' +
      '   • Ses **années d\'expérience**\n' +
      '4️⃣ Cliquez sur **« Voir le profil »** pour accéder au profil complet.\n' +
      '5️⃣ Vous pouvez **accepter** ou **refuser** chaque candidature.\n\n' +
      '📋 Gérez facilement vos recrutements en un seul endroit !',
    actions: [{ label: 'Candidatures reçues', path: '/candidatures-recues' }],
  },
  {
    id: 'modifier-offre',
    keywords: ['modifier offre', 'supprimer offre', 'éditer', 'editer', 'changer offre', 'mettre à jour offre', 'effacer'],
    question: 'Comment modifier ou supprimer une offre ?',
    answer:
      'Pour modifier ou supprimer une offre existante :\n\n' +
      '1️⃣ Allez dans **« Offres »** et trouvez votre offre.\n' +
      '2️⃣ Cliquez sur l\'offre pour voir ses **détails**.\n' +
      '3️⃣ Cliquez sur **« Modifier »** pour changer les informations.\n' +
      '4️⃣ Ou cliquez sur **« Supprimer »** pour retirer l\'offre.\n\n' +
      '⚠️ Attention : la suppression est définitive et les candidatures associées seront perdues.',
    actions: [{ label: 'Mes offres', path: '/offres' }],
  },
  {
    id: 'profil-recruteur',
    keywords: ['profil', 'modifier', 'compléter', 'completer', 'entreprise', 'information', 'photo', 'éditer', 'editer'],
    question: 'Comment compléter mon profil entreprise ?',
    answer:
      'Pour compléter votre profil recruteur :\n\n' +
      '1️⃣ Cliquez sur **votre avatar** en haut à droite.\n' +
      '2️⃣ Accédez à votre page de profil.\n' +
      '3️⃣ Cliquez sur **« Modifier »** et renseignez :\n' +
      '   • **Secteur d\'activité**\n' +
      '   • **Ville** et localisation\n' +
      '   • **Téléphone** de contact\n' +
      '   • **Description** de votre entreprise\n' +
      '   • **Logo / Photo** de profil\n\n' +
      '🏆 Un profil complet inspire confiance et attire les meilleurs artisans !',
    actions: [{ label: 'Modifier mon profil', path: '/profil/edit' }],
  },
  {
    id: 'contacter-candidat',
    keywords: ['contacter', 'message', 'messages', 'écrire', 'ecrire', 'envoyer message', 'communication', 'chat', 'discussion', 'répondre'],
    question: 'Comment contacter un candidat ?',
    answer:
      'Pour contacter un candidat :\n\n' +
      '1️⃣ Depuis les **candidatures reçues**, cliquez sur le profil du candidat.\n' +
      '2️⃣ Utilisez la **messagerie intégrée** pour envoyer un message.\n' +
      '3️⃣ Vous pouvez aussi aller dans **« Messages »** dans la navigation.\n' +
      '4️⃣ Sélectionnez la conversation et rédigez votre message.\n\n' +
      '💬 La messagerie permet une communication rapide et directe avec les candidats !',
    actions: [{ label: 'Messagerie', path: '/messages' }],
  },
  {
    id: 'mot-de-passe-recruteur',
    keywords: ['mot de passe', 'password', 'oublié', 'oublie', 'réinitialiser', 'reinitialiser', 'reset', 'changer mot', 'mdp'],
    question: 'Comment modifier mon mot de passe ?',
    answer:
      'Pour réinitialiser votre mot de passe :\n\n' +
      '1️⃣ Allez sur la page de **connexion**.\n' +
      '2️⃣ Cliquez sur **« Mot de passe oublié ? »**.\n' +
      '3️⃣ Entrez votre **adresse email** professionnelle.\n' +
      '4️⃣ Consultez votre boîte mail.\n' +
      '5️⃣ Cliquez sur le **lien de réinitialisation**.\n' +
      '6️⃣ Choisissez un **nouveau mot de passe**.\n\n' +
      '🔒 Pour la sécurité de votre compte, ne partagez jamais vos identifiants.',
    actions: [{ label: 'Mot de passe oublié', path: '/forgot-password' }],
  },
  {
    id: 'profil-candidat',
    keywords: ['voir profil', 'profil candidat', 'consulter profil', 'compétences', 'expérience candidat'],
    question: 'Comment voir le profil d\'un candidat ?',
    answer:
      'Pour consulter le profil complet d\'un candidat :\n\n' +
      '1️⃣ Allez dans **« Candidatures reçues »**.\n' +
      '2️⃣ Trouvez le candidat qui vous intéresse.\n' +
      '3️⃣ Cliquez sur **« Voir le profil »**.\n' +
      '4️⃣ Vous pourrez consulter :\n' +
      '   • Sa **spécialité** et ses **compétences**\n' +
      '   • Son **expérience** professionnelle\n' +
      '   • Sa **localisation**\n' +
      '   • Son **portfolio** de réalisations\n' +
      '   • Ses **coordonnées**\n\n' +
      '👀 Analysez bien les profils avant de prendre votre décision !',
    actions: [{ label: 'Candidatures reçues', path: '/candidatures-recues' }],
  },
  {
    id: 'connexion-recruteur',
    keywords: ['connexion', 'connecter', 'login', 'accéder', 'entrer', 'problème', 'bug', 'erreur'],
    question: 'Problème de connexion ?',
    answer:
      'Si vous avez des difficultés à vous connecter :\n\n' +
      '1️⃣ Vérifiez votre **adresse email** professionnelle.\n' +
      '2️⃣ Vérifiez votre **mot de passe** (majuscules/minuscules).\n' +
      '3️⃣ Cliquez sur **« Mot de passe oublié ? »** si besoin.\n' +
      '4️⃣ **Videz le cache** de votre navigateur.\n' +
      '5️⃣ Essayez un **autre navigateur**.\n\n' +
      '📧 Support recruteur : recruteur@plateforme.com',
    actions: [{ label: 'Page de connexion', path: '/login' }],
  },
];

// ═══════════════════════════════════════════════
//  MOTEUR DE RECHERCHE NLP (CLIENT-SIDE)
// ═══════════════════════════════════════════════
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestAnswer(query, role) {
  const knowledge = role === 'recruteur' ? knowledgeRecruteur : knowledgeArtisan;
  const normalizedQuery = normalize(query);
  const queryWords = normalizedQuery.split(' ');

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledge) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const normalizedKeyword = normalize(keyword);
      // Exact phrase match scores highest
      if (normalizedQuery.includes(normalizedKeyword)) {
        score += normalizedKeyword.split(' ').length * 3;
      }
      // Individual word match
      const keywordWords = normalizedKeyword.split(' ');
      for (const kw of keywordWords) {
        if (queryWords.includes(kw)) {
          score += 1;
        }
        // Partial match (3+ chars)
        for (const qw of queryWords) {
          if (qw.length >= 3 && kw.length >= 3 && (kw.includes(qw) || qw.includes(kw))) {
            score += 0.5;
          }
        }
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestScore >= 1) {
    return bestMatch;
  }
  return null;
}

// ═══════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════
export default function AIAssistant({ user, isOpen, onClose, embedded }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // For confirmations
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const role = user?.role ? user.role.toString().toLowerCase() : 'artisan';
  const knowledge = role === 'recruteur' ? knowledgeRecruteur : knowledgeArtisan;

  // Message d'accueil
  useEffect(() => {
    if ((isOpen || embedded) && messages.length === 0) {
      const greeting = role === 'recruteur'
        ? `Bonjour${user?.nom ? ' ' + user.nom : ''}\n\nJe suis votre assistant IA dédié aux **recruteurs**. Je peux vous aider à :\n\n• Publier et gérer vos offres d'emploi\n• Consulter les candidatures reçues\n• Contacter les candidats\n• Gérer votre profil entreprise\n\nPosez-moi une question, demandez-moi d'envoyer un message, ou choisissez un sujet ci-dessous !`
        : `Bonjour${user?.nom ? ' ' + user.nom : ''}\n\nJe suis votre assistant IA dédié aux **artisans**. Je peux vous aider à :\n\n• Postuler aux offres d'emploi\n• Suivre vos candidatures\n• Compléter votre profil\n• Gérer votre portfolio\n\nPosez-moi une question, demandez-moi d'envoyer un message, ou choisissez un sujet ci-dessous !`;

      setMessages([{ id: Date.now(), type: 'bot', text: greeting }]);
    }
  }, [isOpen, embedded]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input
  useEffect(() => {
    if ((isOpen || embedded) && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, embedded]);

  const addBotMessage = (text, actions) => {
    setIsTyping(true);
    const delay = Math.min(600 + text.length * 2, 1800);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'bot', text, actions },
      ]);
    }, delay);
  };

  const handleSendMessageIntent = async (recipientName, messageText) => {
    try {
      const res = await api.get('/conversations');
      const conversations = res.data;
      
      const conv = conversations.find(c => c.other_user.nom.toLowerCase().includes(recipientName.toLowerCase()));
      
      if (!conv) {
        addBotMessage(t('ai_assistant.send_message_no_conv'));
        return;
      }
      
      setPendingAction({
        type: 'SEND_MESSAGE',
        convId: conv.id,
        recipientName: conv.other_user.nom,
        text: messageText
      });
      
      addBotMessage(t('ai_assistant.send_message_confirm', { text: messageText, name: conv.other_user.nom }), [
        { label: 'Oui, envoyer', action: 'CONFIRM' },
        { label: 'Non, annuler', action: 'CANCEL' }
      ]);
    } catch (err) {
      addBotMessage("Une erreur s'est produite lors de la vérification de vos conversations.");
    }
  };

  const handleSend = () => {
    const query = inputValue.trim();
    if (!query) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', text: query },
    ]);
    setInputValue('');

    // Check for send message intent using regex
    const sendMsgRegex = /^(?:envoie\s+un\s+message\s+à|send\s+a\s+message\s+to|أرسل\s+رسالة\s+إلى)\s+([^:]+):\s*(.+)$/i;
    const matchMsg = query.match(sendMsgRegex);

    if (matchMsg) {
      const recipientName = matchMsg[1].trim();
      const messageText = matchMsg[2].trim();
      handleSendMessageIntent(recipientName, messageText);
      return;
    }

    const match = findBestAnswer(query, role);
    if (match) {
      addBotMessage(match.answer, match.actions);
    } else {
      const fallback = role === 'recruteur'
        ? `Je n'ai pas trouvé de réponse exacte à votre question.\n\nVoici ce que je peux vous aider avec :\n• Publier une offre d'emploi\n• Consulter les candidatures\n• Contacter un candidat\n• Modifier votre profil\n• Résoudre un problème de connexion\n\n${t('ai_assistant.send_message_hint')}\n\n📧 Vous pouvez aussi contacter : **recruteur@plateforme.com**`
        : `Je n'ai pas trouvé de réponse exacte à votre question.\n\nVoici ce que je peux vous aider avec :\n• Postuler à une offre\n• Suivre mes candidatures\n• Modifier mon profil\n• Gérer mon portfolio\n• Résoudre un problème de connexion\n\n${t('ai_assistant.send_message_hint')}\n\n📧 Vous pouvez aussi contacter : **candidat@plateforme.com**`;
      addBotMessage(fallback);
    }
  };

  const handleSuggestion = (entry) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', text: entry.question },
    ]);
    addBotMessage(entry.answer, entry.actions);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleActionClick = async (action) => {
    if (action.action === 'CONFIRM' && pendingAction?.type === 'SEND_MESSAGE') {
      setMessages((prev) => [...prev, { id: Date.now(), type: 'user', text: 'Oui, envoyer' }]);
      setIsTyping(true);
      try {
        await api.post(`/conversations/${pendingAction.convId}/messages`, { text: pendingAction.text });
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), type: 'bot', text: t('ai_assistant.send_message_success', { name: pendingAction.recipientName }) },
          ]);
          setPendingAction(null);
        }, 1000);
      } catch (err) {
        setIsTyping(false);
        addBotMessage(t('ai_assistant.send_message_error'));
        setPendingAction(null);
      }
    } else if (action.action === 'CANCEL') {
      setMessages((prev) => [...prev, { id: Date.now(), type: 'user', text: 'Non, annuler' }]);
      addBotMessage("Envoi annulé.");
      setPendingAction(null);
    } else if (action.path) {
      if (onClose) onClose();
      navigate(action.path);
    }
  };

  // ═══ Rendu du texte formaté ═══
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.trim() === '') return <br key={i} />;
      
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      
      return (
        <span key={i} style={{ display: 'block' }}>
          {parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={index}>{part.slice(2, -2)}</strong>;
            } else if (part.startsWith('*') && part.endsWith('*')) {
              return <em key={index}>{part.slice(1, -1)}</em>;
            }
            return <span key={index}>{part}</span>;
          })}
        </span>
      );
    });
  };

  // ═══ Quick suggestions (chips) ═══
  const quickSuggestions = knowledge.slice(0, 4);

  if (!isOpen && !embedded) return null;

  return (
    <div className={`ai-assistant ${embedded ? 'ai-assistant--embedded' : 'ai-assistant--floating'}`}>
      {/* Header */}
      {!embedded && (
        <div className="ai-assistant__header">
          <div className="ai-assistant__header-info">
            <div className="ai-assistant__avatar-wrapper">
              <div className="ai-assistant__avatar">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8"/>
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M7 12h2m6 0h2"/>
                  <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1"/>
                </svg>
              </div>
              <span className="ai-assistant__pulse"></span>
            </div>
            <div>
              <h4>Assistant IA</h4>
              <span className="ai-assistant__status">
                {role === 'recruteur' ? 'Mode Recruteur' : 'Mode Artisan'} • En ligne
              </span>
            </div>
          </div>
          <button className="ai-assistant__close" onClick={onClose} aria-label="Fermer l'assistant">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="ai-assistant__messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-assistant__msg ai-assistant__msg--${msg.type}`}>
            {msg.type === 'bot' && (
              <div className="ai-assistant__msg-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M7 12h2m6 0h2"/>
                  <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1"/>
                </svg>
              </div>
            )}
            <div className={`ai-assistant__bubble ai-assistant__bubble--${msg.type}`}>
              <div className="ai-assistant__bubble-text">
                {renderFormattedText(msg.text)}
              </div>
              {msg.actions && msg.actions.length > 0 && (
                <div className="ai-assistant__actions">
                  {msg.actions.map((action, i) => (
                    <button
                      key={i}
                      className="ai-assistant__action-btn"
                      onClick={() => handleActionClick(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="ai-assistant__msg ai-assistant__msg--bot">
            <div className="ai-assistant__msg-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <path d="M7 12h2m6 0h2"/>
                <path d="M9 17c.85.63 1.885 1 3 1s2.15-.37 3-1"/>
              </svg>
            </div>
            <div className="ai-assistant__bubble ai-assistant__bubble--bot ai-assistant__typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="ai-assistant__suggestions">
          {quickSuggestions.map((entry) => (
            <button
              key={entry.id}
              className="ai-assistant__chip"
              onClick={() => handleSuggestion(entry)}
            >
              {entry.question}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="ai-assistant__input-area">
        <input
          ref={inputRef}
          type="text"
          className="ai-assistant__input"
          placeholder="Posez votre question ici..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping}
        />
        <button
          className="ai-assistant__send"
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
          aria-label="Envoyer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
