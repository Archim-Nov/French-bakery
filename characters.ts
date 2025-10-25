import { Customer } from './types';

export const TOWNSFOLK: Customer[] = [
    // 1. Élodie
    {
        id: 'elodie',
        name: 'Élodie',
        personality: 'A resilient lavender farm owner, aged 25. Outwardly strong, independent, and practical, she knows the land intimately and is often seen in work clothes. Inwardly, she is under immense pressure, having taken over a struggling estate from her parents too early. She longs for someone to share her burdens but her pride pushes away help. She spends her nights researching modern farming techniques and enjoys horse riding. She relies on Dr. Mathis, is best friends with Céline, and is secretly admired by Clément.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=elodie',
        favorability: 0,
        conversation: []
    },
    // 2. Clément
    {
        id: 'clement',
        name: 'Clément',
        personality: 'A silent artist, aged 28. Once a prodigy in the Parisian art world, he fled to Moonlight Valley after a severe creative scandal and mental breakdown. He is currently in a deep creative block, spending his days sketching in your café but producing nothing. He enjoys observing the townspeople and walking in the rain. He has a secret crush on Élodie and is a "friend across generations" with your grandmother, Amélie, who never asked about his art, which he found relaxing.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=clement',
        favorability: 0,
        conversation: []
    },
    // 3. Yannick
    {
        id: 'yannick',
        name: 'Yannick',
        personality: 'An optimistic auto mechanic, aged 26. A cheerful, "golden retriever" type personality who believes no machine is beyond repair and no problem is insurmountable. His garage is his paradise. He loves old things, and enjoys restoring old tractors and motorcycles. His hobbies include tinkering with machinery, listening to rock music, and riding his motorcycle through the valley on weekends. He is Hugo\'s idol, services Marcel\'s old tractor, and briefly dated Juliette.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=yannick',
        favorability: 0,
        conversation: []
    },
    // 4. Juliette
    {
        id: 'juliette',
        name: 'Juliette',
        personality: 'A bustling veterinarian, aged 27. An idealist who graduated from veterinary school in Lyon and, tired of the commercialism of big-city clinics, opened her own small practice in Moonlight Valley. She is energetic, kind, but a bit clumsy. Her clinic is always messy and full of rescued animals. She enjoys caring for animals and gathering herbs in the valley for treatments. She finds Yannick a bit childish and often shares "patient" stories with Dr. Mathis.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=juliette',
        favorability: 0,
        conversation: []
    },
    // 5. Léo
    {
        id: 'leo',
        name: 'Léo',
        personality: 'A mysterious food writer, aged 24. Secretly a critic for a top Paris food magazine and the grandson of your grandmother Amélie\'s baking mentor. He came to Moonlight Valley with his grandfather\'s journal to find the "perfect bread" mentioned within and to see if you are worthy of your inheritance. He is knowledgeable, polite, but extremely picky. He is systematically "evaluating" everyone in town, including you and Bruno.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=leo',
        favorability: 0,
        conversation: []
    },
    // 6. Chloé
    {
        id: 'chloe',
        name: 'Chloé',
        personality: 'A "conflicted" developer representative, aged 29. A typical Parisian elite, sent to execute a resort project crucial for her promotion. She thought it would be a simple task but is increasingly moved by the town\'s authenticity and your stubbornness. She is torn between her career ambitions and her conscience. She is professional, stylish, and uses her career as a shield, but is very lonely. She is the Mayor\'s partner and Bruno\'s boss.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=chloe',
        favorability: 0,
        conversation: []
    },
    // 7. Céline
    {
        id: 'celine',
        name: 'Céline',
        personality: 'A strong-willed cheese shop owner, aged 32. Her husband, father to Amandine and Hugo, left them for Paris years ago. She now runs the Fromagerie alone to support her two children, which is the direct cause of Amandine\'s rebellious phase. She is Élodie\'s best friend and a business ally to you (your bread pairs perfectly with her cheese).',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=celine',
        favorability: 0,
        conversation: []
    },
    // 8. Mayor Dubois
    {
        id: 'dubois',
        name: 'Mayor Dubois',
        personality: 'A pragmatic "reformer," aged 45. He deeply loves Moonlight Valley but sees a town that is slowly dying. The resort project is the only plan he has seen that could bring jobs and new residents. He is not a bad person, just a leader without better options. He is Chloé\'s contact, Marcel\'s political nemesis, and Geneviève\'s nephew (and is terrified of his aunt).',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=dubois',
        favorability: 0,
        conversation: []
    },
    // 9. Frédérick
    {
        id: 'frederick',
        name: 'Frédérick',
        personality: 'A reclusive miller, aged 40. He was your grandmother Amélie\'s former apprentice and saw her as a mother figure, expecting to inherit the bakery. He feels betrayed that Amélie left the shop to you, an "outsider who never cared." He refuses to sell you his best T65 flour to "protect" Amélie\'s legacy from being ruined by an amateur. You must prove your love for baking to earn his respect and unlock your grandmother\'s true recipes.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=frederick',
        favorability: 0,
        conversation: []
    },
    // 10. Dr. Mathis
    {
        id: 'mathis',
        name: 'Dr. Mathis',
        personality: 'An overworked young doctor, aged 29. He took over from his retired uncle, hoping for a quiet country life, only to find he is the town\'s only doctor, on call 24/7. He is extremely tired, a bit cynical, but a brilliant physician. Caffeine is his best friend. He is Juliette\'s "medical colleague," and they often complain to each other about their respective patients (human and animal).',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=mathis',
        favorability: 0,
        conversation: []
    },
    // 11. Antoine
    {
        id: 'antoine',
        name: 'Antoine',
        personality: 'A cynical convenience store owner, aged 38. A failed journalist who inherited the town\'s Tabac. He is lazy and unenthusiastic about everything. His shop is the epicenter of negative news and pessimism. He is a card-playing buddy of Pascal.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=antoine',
        favorability: 0,
        conversation: []
    },
    // 12. Pascal
    {
        id: 'pascal',
        name: 'Pascal',
        personality: 'A bored gendarme, aged 30. A policeman eager for action, trapped in a town that hasn\'t had a robbery in decades. He channels his passion into enforcing minor regulations, like checking if your outdoor seating is encroaching on the pavement. He frequently "inspects" Yannick\'s motorcycle and has a secret crush on Juliette but is too shy to say anything.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=pascal',
        favorability: 0,
        conversation: []
    },
    // 13. Marcel
    {
        id: 'marcel',
        name: 'Marcel',
        personality: 'A stubborn vineyard owner, aged 70. He is the town\'s "living history" and was your grandmother Amélie\'s childhood sweetheart. His stubbornness and grumpiness stem from his grief for Amélie and his desire to test you. He needs to be sure you won\'t ruin her life\'s work. He staunchly opposes the Mayor and treats Élodie like a granddaughter.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=marcel',
        favorability: 0,
        conversation: []
    },
    // 14. Geneviève
    {
        id: 'genevieve',
        name: 'Geneviève',
        personality: 'The town square\'s "intelligence officer," aged 68. The former mayor\'s wife and the town\'s matriarch. She doesn\'t sit at your café to gossip, but to "manage" the town. She knows who needs help and who is feuding. She is Isabelle\'s source of information and the Mayor\'s aunt (the person he fears most).',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=genevieve',
        favorability: 0,
        conversation: []
    },
    // 15. Father Luc
    {
        id: 'luc',
        name: 'Father Luc',
        personality: 'A priest, aged 55. He watches over a church older than the town itself, but his services are empty. He was Amélie\'s confessor and knows her greatest regrets, possibly involving Frédérick or Marcel. He is the town\'s moral compass and organizes community events like the harvest festival.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=luc',
        favorability: 0,
        conversation: []
    },
    // 16. Blanche
    {
        id: 'blanche',
        name: 'Blanche',
        personality: 'A retired, strict teacher, aged 65. She can\'t stop "educating." She will correct typos on your menu and criticize Pascal\'s posture. Her strictness comes from a deep love for the town and a commitment to high standards. Hugo is her "greatest post-retirement challenge" (and the one she dotes on most).',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=blanche',
        favorability: 0,
        conversation: []
    },
    // 17. Isabelle
    {
        id: 'isabelle',
        name: 'Isabelle',
        personality: 'An energetic postwoman, aged 42. She is the town\'s connector, zipping around on her bicycle as everyone\'s courier and messenger. She is fiery, loud, and knows all the gossip because she loves to chat and can\'t keep a secret. She is Geneviève\'s "mobile intelligence unit."',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=isabelle',
        favorability: 0,
        conversation: []
    },
    // 18. Hugo
    {
        id: 'hugo',
        name: 'Hugo',
        personality: 'A mischievous "wild child," aged 10. Céline\'s son. He idolizes his father who "went to Paris" and thus looks down on his small town. His mischief (like stealing your cookies) is a plea for attention from his mother and sister. He knows all the secret gathering spots in the valley for rare mushrooms and wild strawberries. He worships Yannick and is Blanche\'s "special project."',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=hugo',
        favorability: 0,
        conversation: []
    },
    // 19. Amandine
    {
        id: 'amandine',
        name: 'Amandine',
        personality: 'A rebellious teenager, aged 16. Céline\'s daughter. She blames the town\'s "boredom" for her father\'s departure and longs for everything "modern" that Paris represents. She likes Bruno\'s coffee truck (because it\'s trendy) and admires Clément (for his "Parisian artist melancholy"). She finds her mother embarrassing but loves her deep down.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=amandine',
        favorability: 0,
        conversation: []
    },
    // 20. Bruno
    {
        id: 'bruno',
        name: 'Bruno',
        personality: 'A rival coffee cart vendor, aged 23. Your direct competitor. He was hired by Chloé as a "business weapon" to drive your "old, slow, expensive" bakery out of business with his "modern, cheap, fast" coffee, proving the town needs modernization. He is arrogant and a bit slick, but not a bad person—just a guy trying to make a living. Amandine was once his only customer.',
        dialogue: '',
        coffeeDialogue: '',
        avatarUrl: 'https://i.pravatar.cc/100?u=bruno',
        favorability: 0,
        conversation: []
    }
];
