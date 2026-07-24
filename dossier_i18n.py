# -*- coding: utf-8 -*-
"""Tables de traduction du dossier Star Wars — (français, anglais)."""

# ── Repères écran : films, jeux, spéciaux. Les épisodes de séries sont résolus via TMDB.
SCREEN = {
 "THE ACOLYTE EPISODES 1-2":      ("THE ACOLYTE — ÉPISODES 1-2", "THE ACOLYTE — EPISODES 1-2"),
 "THE ACOLYTE EPISODES 3-8":      ("THE ACOLYTE — ÉPISODES 3-8", "THE ACOLYTE — EPISODES 3-8"),
 "EPISODE 1 LA MENACE FANTOME":   ("ÉPISODE I : LA MENACE FANTÔME", "EPISODE I: THE PHANTOM MENACE"),
 "EPISODE 2 L'ATTAQUE DES CLONES":("ÉPISODE II : L'ATTAQUE DES CLONES", "EPISODE II: ATTACK OF THE CLONES"),
 "THE CLONE WARS FILM":           ("THE CLONE WARS — LE FILM", "THE CLONE WARS — THE MOVIE"),
 "EPISODE 3 LA REVANCHE DES SITH":("ÉPISODE III : LA REVANCHE DES SITH", "EPISODE III: REVENGE OF THE SITH"),
 "THE BAD BATCH SAISON 1 EPISODE 6": ("THE BAD BATCH — S1E6", "THE BAD BATCH — S1E6"),
 "THE BAD BATCH SAISON 1 FINAL":  ("THE BAD BATCH — FINAL DE LA SAISON 1", "THE BAD BATCH — SEASON 1 FINALE"),
 "THE BAD BATCH SAISON 2 EPISODE 13": ("THE BAD BATCH — S2E13", "THE BAD BATCH — S2E13"),
 "THE BAD BATCH FINAL":           ("THE BAD BATCH — FINAL DE SÉRIE", "THE BAD BATCH — SERIES FINALE"),
 "MAUL SHADOW LORD":              ("MAUL : SEIGNEUR DE L'OMBRE", "MAUL: SHADOW LORD"),
 "JEDI FALLEN ORDER":             ("JEDI : FALLEN ORDER", "JEDI: FALLEN ORDER"),
 "SOLO":                          ("SOLO", "SOLO"),
 "OWI WAN KENOBI":                ("OBI-WAN KENOBI", "OBI-WAN KENOBI"),
 "ANDOR SAISON 1":                ("ANDOR — SAISON 1", "ANDOR — SEASON 1"),
 "STAR WARS REBELES EPISODE FINAL":("STAR WARS REBELS — FINAL DE SÉRIE", "STAR WARS REBELS — SERIES FINALE"),
 "ROGUE ONE":                     ("ROGUE ONE", "ROGUE ONE"),
 "EPISODE IV A NEW HOPE":         ("ÉPISODE IV : UN NOUVEL ESPOIR", "EPISODE IV: A NEW HOPE"),
 "EPISODE V L'EMPIRE CONTRE ATTAQUE": ("ÉPISODE V : L'EMPIRE CONTRE-ATTAQUE", "EPISODE V: THE EMPIRE STRIKES BACK"),
 "STAR WARS OUTLAWS":             ("STAR WARS OUTLAWS", "STAR WARS OUTLAWS"),
 "EPISODE VI RETURN OF THE JEDI": ("ÉPISODE VI : LE RETOUR DU JEDI", "EPISODE VI: RETURN OF THE JEDI"),
 "BATTLEFRONT II MISSION 1":      ("BATTLEFRONT II — MISSION 1", "BATTLEFRONT II — MISSION 1"),
 "BATTLEFRONT II MISSION 2-3":    ("BATTLEFRONT II — MISSIONS 2-3", "BATTLEFRONT II — MISSIONS 2-3"),
 "BATTLEFRONT II MISSION 4":      ("BATTLEFRONT II — MISSION 4", "BATTLEFRONT II — MISSION 4"),
 "BATTLEFRONT II MISSION 5-6":    ("BATTLEFRONT II — MISSIONS 5-6", "BATTLEFRONT II — MISSIONS 5-6"),
 "SQUADRONS":                     ("SQUADRONS", "SQUADRONS"),
 "BATTLEFRONT II MISSION 7-9":    ("BATTLEFRONT II — MISSIONS 7-9", "BATTLEFRONT II — MISSIONS 7-9"),
 "BATTLEFRONT II MISSION 10-11":  ("BATTLEFRONT II — MISSIONS 10-11", "BATTLEFRONT II — MISSIONS 10-11"),
 "THE MANDALORIAN AND GROGU":     ("THE MANDALORIAN ET GROGU", "THE MANDALORIAN AND GROGU"),
 "EPISODE VII THE FORCE AWAKENS": ("ÉPISODE VII : LE RÉVEIL DE LA FORCE", "EPISODE VII: THE FORCE AWAKENS"),
 # ⚠ la source indiquait « EPISODE VII » : il s'agit bien de l'Épisode VIII
 "EPISODE VII THE LAST JEDI":     ("ÉPISODE VIII : LES DERNIERS JEDI", "EPISODE VIII: THE LAST JEDI"),
 "EPISODE IX THE RISE OF SKYWALKER": ("ÉPISODE IX : L'ASCENSION DE SKYWALKER", "EPISODE IX: THE RISE OF SKYWALKER"),
}

# ── Séries dont les épisodes sont résolus via TMDB : préfixe -> (nom TMDB, année)
SHOWS = {
 "THE CLONE WARS":    ("Star Wars: The Clone Wars", 2008),
 "STAR WARS REBELS":  ("Star Wars Rebels", 2014),
}

# ── Annotations entre parenthèses
NOTES = {
 "audiobook but script book available":
   ("livre audio, le script est publié en livre", "audio drama, script published as a book"),
 "pendant The High Republic: The Rising Storm":
   ("pendant The High Republic: The Rising Storm", "during The High Republic: The Rising Storm"),
 "pendant EPISODE V L'EMPIRE CONTRE ATTAQUE":
   ("pendant l'Épisode V", "during Episode V"),
 "prologue et epilogue just before EPISODE VII THE FORCE AWAKENS":
   ("prologue et épilogue juste avant l'Épisode VII", "prologue and epilogue just before Episode VII"),
 "pendant EPISODE VII THE FORCE AWAKENS":
   ("pendant l'Épisode VII", "during Episode VII"),
 "pendant The High Republic: Light of the Jedi":
   ("pendant The High Republic: Light of the Jedi", "during The High Republic: Light of the Jedi"),
 "pendant EPISODE 1 LA MENACE FANTOME":
   ("pendant l'Épisode I", "during Episode I"),
 "prologue pendant EPISODE VI RETURN OF THE JEDI":
   ("prologue pendant l'Épisode VI", "prologue during Episode VI"),
 "avant et pendant The High Republic: Light of the Jedi":
   ("avant et pendant The High Republic: Light of the Jedi", "before and during The High Republic: Light of the Jedi"),
 "prologue pendant The High Republic: Temptation of the Force":
   ("prologue pendant The High Republic: Temptation of the Force", "prologue during The High Republic: Temptation of the Force"),
 "pendant The High Republic: Tears of the Nameless":
   ("pendant The High Republic: Tears of the Nameless", "during The High Republic: Tears of the Nameless"),
 "epilogue pendant EPISODE 1 LA MENACE FANTOME":
   ("épilogue pendant l'Épisode I", "epilogue during Episode I"),
 "avant et pendant EPISODE 1 LA MENACE FANTOME, epilogue PENDANT EPISODE IV A NEW HOPE":
   ("avant et pendant l'Épisode I, épilogue pendant l'Épisode IV",
    "before and during Episode I, epilogue during Episode IV"),
 "prologue pendant EPISODE 1 LA MENACE FANTOME, epilogue pendant EPISODE III LA REVANCHE DES SITH":
   ("prologue pendant l'Épisode I, épilogue pendant l'Épisode III",
    "prologue during Episode I, epilogue during Episode III"),
 "pendant et après EPISODE II ATTACK FO THE CLONES":
   ("pendant et après l'Épisode II", "during and after Episode II"),
 "before and after Darth Maul : Son of Dathomir":
   ("avant et après Darth Maul: Son of Dathomir", "before and after Darth Maul: Son of Dathomir"),
 "pendant et après EPISODE II ATTACK OF THE CLONES":
   ("pendant et après l'Épisode II", "during and after Episode II"),
 "avant et pendant SOLO":
   ("avant et pendant Solo", "before and during Solo"),
 "avant et pendant BREAKING RANKS":
   ("avant et pendant l'épisode Breaking Ranks de Rebels", "before and during the Rebels episode Breaking Ranks"),
 "prologue during Kanan 7":
   ("prologue pendant Kanan 7", "prologue during Kanan 7"),
 "avant et pendant VISION OF HOPE":
   ("avant et pendant l'épisode Vision of Hope de Rebels", "before and during the Rebels episode Vision of Hope"),
 "avant, pendant et après FIRE ACROSS THE GALAXY":
   ("avant, pendant et après l'épisode Fire Across the Galaxy de Rebels",
    "before, during and after the Rebels episode Fire Across the Galaxy"),
 "pendant et après EPISODE IV A NEW HOPE":
   ("pendant et après l'Épisode IV", "during and after Episode IV"),
 "avant et pendant War of the Bounty Hunters : Aphra":
   ("avant et pendant War of the Bounty Hunters: Aphra", "before and during War of the Bounty Hunters: Aphra"),
 "epilogue pendant STAR WARS OUTLAWS":
   ("épilogue pendant Star Wars Outlaws", "epilogue during Star Wars Outlaws"),
 "pendant et après EPISODE VI RETURN OF THE JEDI":
   ("pendant et après l'Épisode VI", "during and after Episode VI"),
 "pendant et après Shattered Empire 3":
   ("pendant et après Shattered Empire 3", "during and after Shattered Empire 3"),
 "pendant Aftermath : Empire's End":
   ("pendant Aftermath: Empire's End", "during Aftermath: Empire's End"),
 "avant, pendant et après EPISODES IV - V - VI, prologue en 11 BBY":
   ("avant, pendant et après les Épisodes IV, V et VI · prologue en 11 BBY",
    "before, during and after Episodes IV, V and VI · prologue in 11 BBY"),
 "pendant et après EPISODE VII THE FORCE AWAKENS":
   ("pendant et après l'Épisode VII", "during and after Episode VII"),
}

# ── Ères
ERAS = {
 "THE HIGH REPUBLIC ERA": ("L'ÈRE DE LA HAUTE RÉPUBLIQUE", "THE HIGH REPUBLIC ERA"),
 "THE REPUBLIC ERA":      ("L'ÈRE DE LA RÉPUBLIQUE", "THE REPUBLIC ERA"),
 "THE CLONE WARS ERA":    ("LA GUERRE DES CLONES", "THE CLONE WARS"),
 "THE IMPERIAL ERA":      ("L'ÈRE DE L'EMPIRE", "THE IMPERIAL ERA"),
 "THE REBELLION ERA":     ("L'ÈRE DE LA RÉBELLION", "THE REBELLION ERA"),
 "THE NEW REPUBLIC ERA":  ("L'ÈRE DE LA NOUVELLE RÉPUBLIQUE", "THE NEW REPUBLIC ERA"),
 "THE FIRST ORDER ERA":   ("L'ÈRE DU PREMIER ORDRE", "THE FIRST ORDER ERA"),
}

INTRO_FR = (
 "Si vous souhaitez découvrir les romans et comics Star Wars, vous êtes au bon endroit. "
 "Je considère que si vous êtes ici, vous avez déjà regardé les médias animés et live action.<br><br>"
 "Les médias omis sont les mêmes que pour la timeline principale, sauf <strong>The Acolyte</strong>, "
 "qui est peut-être intéressant à voir si vous lisez les comics : c'est le seul média cinématographique "
 "(hors <strong>Star Wars: Young Jedi Adventures</strong>) se déroulant pendant la Haute République.<br><br>"
 "Les comics omis sont des one shots inutiles, des comics pour enfants ou des adaptations de médias "
 "cinématographiques.")

INTRO_EN = (
 "If you want to get into the Star Wars novels and comics, you're in the right place. "
 "I'm assuming that if you're here, you've already watched the animated and live-action media.<br><br>"
 "The omitted media are the same as on the main timeline, except <strong>The Acolyte</strong>, "
 "which may be worth watching if you read the comics: it's the only screen production "
 "(besides <strong>Star Wars: Young Jedi Adventures</strong>) set during the High Republic.<br><br>"
 "The omitted comics are throwaway one-shots, comics aimed at young children, or adaptations of "
 "screen productions.")


# ── Filet de sécurité : appliqué UNIQUEMENT si Wookieepedia n'a rien donné.
# Séries dont tous les titres du dossier sont des comics.
SERIES_KIND = {
    "star wars rebels magazine": "comic",
    "age of republic": "comic",
    "age of rebellion": "comic",
    "age of resistance": "comic",
    "empire ascendant": "comic",
    "battle of jakku": "comic",
    "war of the bounty hunters": "comic",
    "a new legacy": "comic",
    "darth vader": "comic",
    "return of the jedi": "comic",
    "the last jedi": "comic",
    "the acolyte": "comic",
    "free comic book day": "comic",
    "hyperspace stories": "comic",
    "star wars adventures": "comic",
}
# Titres exacts qui échappent aux règles ci-dessus
TITLE_KIND = {
    "ahsoka": "roman",              # le roman d'E. K. Johnston, et non un comic
}


FR_OVERRIDE_RAW = {
 "The High Republic: The Blade": "La Haute République : La Lame",
 "The High Republic Adventures": "La Haute République : Les Aventures",
 "The High Republic (2022): Peace and Unity": "La Haute République : Paix et Unité",
 "The High Republic": "La Haute République",
 "The High Republic Adventures: Pathfinders": None,
 "The High Republic Adventures Annual 2021: Set for Life": "La Haute République : Les Aventures Annuel 2021 - À l'Abri",
 "The High Republic Adventures Annual 2021: First Mission": "La Haute République : Les Aventures Annuel 2021 - Première Mission",
 "The High Republic Adventures: The Monster of Temple Peak": "La Haute République : Les Aventures — Le Monstre du Pic du Temple",
 "The High Republic Adventures Free Comic Book Day 2021": "La Haute République : Les Aventures Free Comic Book Day 2021",
 "The High Republic: Trail of Shadows": "Star Wars : La Haute République : La Piste des Ombres",
 "The High Republic Adventures Annual 2021: The Haul": "La Haute République : Les Aventures Annuel 2021 - Le Butin",
 "The High Republic Adventures: Galactic Bake-Off Spectacular": "La Haute République : Les Aventures - La Force des Fourneaux",
 "The High Republic Adventures Annual 2021: Crash and the Crew Do What They Do": "La Haute République : Les Aventures Annuel 2021 - Crash et Son Équipe Assurent Toujours",
 "The High Republic Adventures Annual 2021: No Stone Unturned": "La Haute République : Les Aventures Annuel 2021 - Dans le Moindre Recoin",
 "The High Republic: Shadows of Starlight": "La Haute République : Les Ombres du Flambeau",
 "The High Republic: Eye of the Storm": "La Haute République : L'Œil du Cyclone",
 "The High Republic Adventures - The Nameless Terror": "La Haute République : Les Aventures : La Terreur Sans Nom",
 "The High Republic Adventures Phase III: The Wedding Spectacular": "La Haute République : Les Aventures - Spectaculaire Mariage",
 "The High Republic: Fear of the Jedi": "La Haute République : La Peur des Jedi",
 "The High Republic: The Finale": "La Haute République : Le Final",
 "Revelations (2023): All the Republic": "Revelations (2023) : Toute la République",
 "Revelations (2023): Showdown at Ocean's Deep": "Revelations (2023) : Affrontement dans les Profondeurs de l'Océan",
 "Revelations (2023): Stolen Hope": "Revelations (2023) : L'Espoir Volé",
 "Revelations (2023): A Trick of the Mind": "Revelations (2023) : Une Ruse de l'Esprit",
 "Revelations (2023): Tool of the Empire": "Revelations (2023) : L'Outil de l'Empire",
 "Revelations (2023): Tall Tales": "Revelations (2023) : Grandes Histoires",
 "Revelations (2023): Duel of the Reprobates": "Revelations (2023) : Le Duel des Réprouvés",
 "The Acolyte: Kelnacca": None,
 "Mace Windu": "Mace Windu",
 "Padawan": "Padawan",
 "Age of Republic: Qui-Gon Jinn": "L'Ère de la République : Qui-Gon Jinn",
 "Age of Republic Special: The Weapon": "L'Ère de la République Spécial : L'Arme",
 "Age of Republic: Darth Maul": "L'Ère de la République : Dark Maul",
 "Darth Maul (2017): Probe Droid Problem": "Dark Maul (2017) : Problèmes de Droïde Sonde",
 "Age of Republic: Obi-Wan Kenobi": "L'Ère de la République : Obi-Wan Kenobi",
 "Age of Republic: Count Dooku": "L'Ère de la République : Comte Dooku",
 "Age of Republic: Jango Fett": "L'Ère de la République : Jango Fett",
 "Jedi of the Republic: Mace Windu": "Mace Windu : Jedi de la République",
 "Age of Republic Special: 501 Plus One": "L'Ère de la République Spécial : 501 Plus Un",
 "Star Wars Adventures: The Clone Wars - Battle Tales": None,
 "Age of Republic: Anakin Skywalker": "L'Ère de la République : Anakin Skywalker",
 "Hyperspace Stories: The Bad Batch - Ghost Agents": "Histoires de l'Hyperespace : The Bad Batch - Agents Fantômes",
 "Hyperspace Stories: The Bad Batch - Rogue Agents": None,
 "Age of Republic: General Grievous": "L'Ère de la République : Général Grievous",
 "Age of Republic Special: Sisters": "L'Ère de la République Spécial : Sœurs",
 "Darth Maul: Son of Dathomir": "Dark Maul : Fils de Dathomir",
 "Age of Republic: Padmé Amidala": "L'Ère de la République : Padmé Amidala",
 "Darth Vader (2017): No Good Deed": "Dark Vador : Seigneur Noir des Sith 1 - L'Élu - No Good Deed",
 "Rogue One - Saw Guerrera": None,
 "Shadow of Maul": None,
 "Han Solo: Imperial Cadet": "Han Solo : Cadet Impérial",
 "Beckett": "Beckett : L'Homme en Noir",
 "Servants of the Empire: Rebel in the Ranks": "Des Rebelles dans les Rangs",
 "A New Dawn": "Une Nouvelle Aube",
 "Servants of the Empire: Imperial Justice": "Justice Impériale",
 "Servants of the Empire: The Secret Academy": "L'Académie Secrète",
 "Rogue One: Cassian & K-2SO Special": None,
 "Age of Rebellion: Darth Vader": "L'Ère de la Rébellion : Dark Vador",
 "Age of Rebellion Special: The Long Game": "L'Ère de la Rébellion Spécial : La Quête de la Perfection",
 "A New Legacy: The Grand Imperial Jubilee": None,
 "Vader: Dark Visions": "Vador : Sombres Visions",
 "The Mighty Chewbacca in the Forest of Fear!": None,
 
 "Age of Rebellion Special: Stolen Valor": "L'Ère de la Rébellion Spécial : Valeur Volée",
 "Rogue One - Jyn Erso": None,
 "Rogue One - Cassian Andor": None,
 "Age of Rebellion: Han Solo": "L'Ère de la Rébellion : Han Solo",
 "Age of Resistance Special: The Bridge": "L'Ère de la Résistance Spécial : La Passerelle",
 "A New Legacy: Rogue's Gambit": None,
 "Vader Down": "Vador Abattu",
 "The Screaming Citadel": "La Citadelle Hurlante",
 "The Last Jedi: The Storms of Crait": "Les Derniers Jedi : Les Tempêtes de Crait",
 "A New Legacy: For the Love of the Empire": None,
 "Age of Rebellion: Jabba the Hutt": "L'Ère de la Rébellion : Jabba le Hutt",
 "Empire Ascendant: An Echo of Victory": "Empire Ascendant : L'Écho de la Victoire",
 "Age of Rebellion: Boba Fett": "L'Ère de la Rébellion : Boba Fett",
 "Empire Ascendant: In Service of the Empire": "Empire Ascendant : Au Service de l'Empire",
 "Empire Ascendant: Two Sides to Every Sortie": "Empire Ascendant : Les Deux Versions de l'Histoire",
 "Age of Rebellion Special: The Trial of Dagobah": "L'Ère de la Rébellion : L'Épreuve de Dagobah",
 "Star Wars Outlaws: Low Red Moon": None,
 "Return of the Jedi: The Empire": "Le Retour du Jedi : L'Empire",
 "Return of the Jedi: Lando": "Le Retour du Jedi : Lando",
 "Return of the Jedi: The Rebellion": "Le Retour du Jedi : La Rébellion",
 "Return of the Jedi: Jabba's Palace": "Le Retour du Jedi : Le Palais de Jabba",
 "Return of the Jedi: Ewoks": "Le Retour du Jedi : Les Ewoks",
 "Battle of Jakku: Insurgency Rising": "La Bataille de Jakku : L'Aube de l'Insurrection",
 "Battle of Jakku: Insurgency Rising 1 - The Rising": "La Bataille de Jakku : L'Aube de l'Insurrection - L'Avènement",
 "Aftermath: Life Debth": "Riposte : Dette de vie",
 "Battle of Jakku: Republic Under Siege": "La Bataille de Jakku : La République Assiégée",
 "Battle of Jakku: Last Stand": "La Bataille de Jakku : Baroud d'Honneur",
 "Battle of Jakku: Republic Under Siege 1 - Consolidation": "La Bataille de Jakku : La République Assiégée - Consolidation",
 "Battle of Jakku: Last Stand 1 - False Histories": "La Bataille de Jakku : Baroud d'Honneur - Fausses Histoires",
 "Bloodline": "Liens du Sang",
 "Age of Resistance Special: Maz's Scoundrels": "L'Ère de la Résistance Spécial : Les Vauriens de Maz",
 "Age of Resistance: Finn": "L'Ère de la Résistance : Finn",
 "Age of Resistance Special: Robot Resistance": "L'Ère de la Résistance Spécial : Résistance Robotique",
 "Age of Resistance: General Hux": "L'Ère de la Résistance : Général Hux",
 "Age of Resistance: Kylo Ren": "L'Ère de la Résistance : Kylo Ren",
 "Age of Resistance: Rey": "L'Ère de la Résistance : Rey",
 "Hyperspace Stories: Codebreaker": "Histoires de l'Hyperespace : La Décrypteuse",
 "Join the Resistance: Escape from Vodran": "Rejoins la Résistance 2",
 "Join the Resistance: Attack on Starkiller Base": "Rejoins la Résistance 3",
 "Galaxy's Edge: Black Spire": None,
 "Galaxy's Edge - Echoes of the Empire": None,
 "The Last Jedi: DJ - Most Wanted": "Les Derniers Jedi – Ennemi Public Numéro Un",
 "Star Wars Adventures (2020) 6: Tales of Villainy - The Gaze Electric": None,
 "Star Wars Adventures: Destroyer Down": None,
 "Star Wars Adventures: Destroyer Down - The Ghost Ship": None,
}

# Séries dont seul le début du titre se traduit (le sous-titre et le numéro sont conservés)
FR_PREFIX = {
 "Darth Vader : Black, White & Red": "Dark Vador : Black, White & Red",
}
