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
