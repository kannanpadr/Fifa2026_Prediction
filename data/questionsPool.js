// 30-Day FIFA World Cup & Rules Daily Quiz Pool
const dailyWorldCupQuiz = {
  day1: [
    { q: "According to FIFA rules, what happens if a knockout match is still tied after 30 minutes of extra time?", o: ["A coin toss determines the winner", "A penalty shootout takes place", "The team with fewer yellow cards wins", "The match is replayed"], a: 1, d: "easy" },
    { q: "Which nation holds the record for the most consecutive defeats in FIFA World Cup history?", o: ["El Salvador", "Mexico", "Saudi Arabia", "Togo"], a: 1, d: "medium" },
    { q: "Who is the only player to win the World Cup Golden Ball award twice?", o: ["Pelé", "Diego Maradona", "Lionel Messi", "Ronaldo Nazário"], a: 2, d: "medium" },
    { q: "In the 2022 FIFA World Cup, what was the maximum number of players permitted in a team's final squad list?", o: ["23", "25", "26", "28"], a: 2, d: "hard" },
    { q: "Who scored the first-ever hat-trick in FIFA World Cup history in 1930?", o: ["Bert Patenaude", "Guillermo Stábile", "Lucien Laurent", "Pedro Cea"], a: 0, d: "expert" }
  ],
  day2: [
    { q: "How many yellow cards in separate matches during a standard World Cup tournament result in a one-match suspension before the semi-finals?", o: ["1", "2", "3", "4"], a: 1, d: "easy" },
    { q: "Which country has played the most World Cup matches in history without ever reaching a final?", o: ["Mexico", "Belgium", "Sweden", "Switzerland"], a: 0, d: "medium" },
    { q: "Who was the first goalkeeper to win the Golden Ball award for the tournament's best overall player?", o: ["Oliver Kahn", "Dino Zoff", "Iker Casillas", "Lev Yashin"], a: 0, d: "medium" },
    { q: "Which country was the first to be eliminated from a World Cup group stage despite winning two out of three matches?", o: ["Algeria", "Scotland", "Italy", "Norway"], a: 1, d: "hard" },
    { q: "Who is the oldest referee to ever officiate a match in a FIFA World Cup tournament?", o: ["George Reader", "Pierluigi Collina", "Saíd Martínez", "Nestor Pitana"], a: 0, d: "expert" }
  ],
  day3: [
    { q: "What is the minimum number of players a team must have on the pitch for a World Cup match to continue?", o: ["6", "7", "8", "9"], a: 1, d: "easy" },
    { q: "Which host nation was the first to be eliminated in the opening group stage of a World Cup?", o: ["South Africa", "Qatar", "USA", "Japan"], a: 0, d: "medium" },
    { q: "Who is the all-time top goalscorer for Italy in World Cup history?", o: ["Roberto Baggio", "Christian Vieri", "Paolo Rossi", "Both Baggio and Vieri"], a: 3, d: "medium" },
    { q: "Which player holds the record for the most assists recorded in a single World Cup tournament?", o: ["Pelé", "Diego Maradona", "Lionel Messi", "Thomas Müller"], a: 0, d: "hard" },
    { q: "Which team scored the highest number of goals in a single World Cup tournament?", o: ["Hungary (1954)", "West Germany (1954)", "Brazil (1950)", "France (1958)"], a: 0, d: "expert" }
  ],
  day4: [
    { q: "If a player receives a direct red card during a World Cup match, how many matches are they automatically suspended for at minimum?", o: ["1 match", "2 matches", "3 matches", "The entire tournament"], a: 0, d: "easy" },
    { q: "Which city has hosted the most FIFA World Cup Final matches?", o: ["Mexico City", "Rio de Janeiro", "Rome", "Paris"], a: 0, d: "medium" },
    { q: "Who is the only individual to win the World Cup as both a player and a manager for Germany?", o: ["Franz Beckenbauer", "Jürgen Klinsmann", "Rudi Völler", "Joachim Löw"], a: 0, d: "medium" },
    { q: "Under FIFA regulations, what is the exact weight range allowed for an official match ball at the start of a match?", o: ["350-400 grams", "410-450 grams", "460-500 grams", "380-420 grams"], a: 1, d: "hard" },
    { q: "Which team was the first to win a World Cup match via a golden goal?", o: ["France", "Germany", "Italy", "South Korea"], a: 0, d: "expert" }
  ],
  day5: [
    { q: "Which of these is NOT an official criterion used by FIFA to separate teams tied on points in a World Cup group?", o: ["Goal difference", "Goals scored", "Head-to-head record", "Number of corner kicks taken"], a: 3, d: "easy" },
    { q: "Which team holds the record for the longest unbeaten streak in World Cup history?", o: ["Brazil", "Germany", "Italy", "Spain"], a: 0, d: "medium" },
    { q: "Who scored the fastest goal ever in a World Cup Final match?", o: ["Johan Neeskens", "Zinedine Zidane", "Pelé", "Mario Mandžukić"], a: 0, d: "medium" },
    { q: "Which player has received the most total yellow cards in World Cup history?", o: ["Javier Mascherano", "Cafu", "Zinedine Zidane", "Rigobert Song"], a: 0, d: "hard" },
    { q: "What was the specific reason the 1950 World Cup group stage featured an uneven group of only two teams?", o: ["India withdrew over footwear, and France withdrew over travel schedules", "Teams failed to qualify", "Political boycotts by European nations", "Logistical transport strikes in Brazil"], a: 0, d: "expert" }
  ],
  day6: [
    { q: "According to current FIFA laws, if a substitute player enters the pitch and interferes with play, what is awarded?", o: ["Direct free kick or penalty", "Indirect free kick", "Dropped ball", "Penalty only"], a: 0, d: "easy" },
    { q: "Which confederation has produced the highest number of unique World Cup winning nations?", o: ["UEFA", "CONMEBOL", "CAF", "CONCACAF"], a: 0, d: "medium" },
    { q: "Who was the captain of the legendary 1970 Brazil World Cup winning squad?", o: ["Carlos Alberto", "Pelé", "Gérson", "Rivelino"], a: 0, d: "medium" },
    { q: "Which country has played in the most World Cup penalty shootouts?", o: ["Argentina", "Germany", "Spain", "Italy"], a: 0, d: "hard" },
    { q: "Who is the only player to score a hat-trick in a World Cup match against a reigning world champion?", o: ["Paolo Rossi", "Gerd Müller", "Sandor Kocsis", "Pelé"], a: 0, d: "expert" }
  ],
  day7: [
    { q: "How many host countries will share the hosting responsibilities for the 2026 FIFA World Cup?", o: ["2", "3", "4", "5"], a: 1, d: "easy" },
    { q: "Which player holds the record for scoring goals in the most consecutive World Cup matches?", o: ["Just Fontaine", "Jairzinho", "Gerd Müller", "Ronaldo Nazário"], a: 1, d: "medium" },
    { q: "Who is the all-time top scorer for France in World Cup history?", o: ["Just Fontaine", "Thierry Henry", "Kylian Mbappé", "Zinedine Zidane"], a: 0, d: "medium" },
    { q: "Which match holds the record for the highest number of cards (yellow and red) issued in World Cup history?", o: ["Portugal vs Netherlands (2006)", "Argentina vs Netherlands (2022)", "Cameroon vs Germany (2002)", "Chile vs Italy (1962)"], a: 1, d: "hard" },
    { q: "In which year did FIFA officially introduce the Fair Play tiebreaker rule based on yellow/red card counts?", o: ["2010", "2014", "2018", "2022"], a: 2, d: "expert" }
  ],
  day8: [
    { q: "In World Cup matches, if a penalty kick bounces off the post back to the kicker without touching anyone, can they shoot again?", o: ["Yes, play continues", "No, an indirect free kick is awarded to the defense", "No, a goal kick is awarded", "Yes, but only inside the 6-yard box"], a: 1, d: "easy" },
    { q: "Which nation achieved the best performance by a debutant country in the modern era by finishing third in 1998?", o: ["Croatia", "Senegal", "Ukraine", "Morocco"], a: 0, d: "medium" },
    { q: "Who is the oldest outfield player to play in a World Cup Final?", o: ["Dino Zoff", "Nílton Santos", "Gunnar Gren", "Cafu"], a: 2, d: "medium" },
    { q: "Which country was the first to qualify for the knockout stage of a World Cup with a negative goal difference?", o: ["Uruguay", "North Korea", "Bulgaria", "South Korea"], a: 0, d: "hard" },
    { q: "Who was the designer of the original Jules Rimet World Cup trophy?", o: ["Abel Lafleur", "Silvio Gazzaniga", "Bertoni", "Louis Vuitton"], a: 0, d: "expert" }
  ],
  day9: [
    { q: "True or False: A player can be penalized for an offside offense if they receive the ball directly from a corner kick.", o: ["True", "False"], a: 1, d: "easy" },
    { q: "Which country has won the most FIFA World Cup matches without ever lifting the trophy?", o: ["Netherlands", "Sweden", "Mexico", "Belgium"], a: 0, d: "medium" },
    { q: "Who was the manager of the French national team when they won their first World Cup title in 1998?", o: ["Aimé Jacquet", "Roger Lemerre", "Raymond Domenech", "Didier Deschamps"], a: 0, d: "medium" },
    { q: "Which player holds the record for the most total World Cup matches played as captain?", o: ["Diego Maradona", "Lionel Messi", "Rafael Márquez", "Dino Zoff"], a: 1, d: "hard" },
    { q: "Which nation withdrew from the 1930 World Cup because they refused to accept the long boat journey to South America?", o: ["Egypt", "Siam", "India", "Japan"], a: 0, d: "expert" }
  ],
  day10: [
    { q: "What is the official distance from the penalty spot to the goal line in football regulations?", o: ["10 yards", "11 meters (approx. 12 yards)", "12 meters", "9.15 meters"], a: 1, d: "easy" },
    { q: "Which team was the first from Asia to reach a World Cup semi-final?", o: ["South Korea", "Japan", "North Korea", "Saudi Arabia"], a: 0, d: "medium" },
    { q: "Who scored the winning goal in extra time during the 1966 World Cup Final?", o: ["Geoff Hurst", "Bobby Charlton", "Martin Peters", "Bobby Moore"], a: 0, d: "medium" },
    { q: "Which goalkeeper has kept the most clean sheets in FIFA World Cup history?", o: ["Peter Shilton & Fabien Barthez", "Gianluigi Buffon & Iker Casillas", "Manuel Neuer & Oliver Kahn", "Dino Zoff & Walter Zenga"], a: 0, d: "hard" },
    { q: "What unique historical rule quirk occurred during the 1974 World Cup match between Zaire and Brazil?", o: ["Mwepu Ilunga ran out of the wall to kick the ball before Brazil took a free kick", "Zaire played with 12 players for five minutes", "The referee blew the final whistle 5 minutes early", "The match was played without corner flags"], a: 0, d: "expert" }
  ],
  day11: [
    { q: "If a player receives two yellow cards in separate group stage matches, when are these cards wiped clean?", o: ["After the group stage", "After the round of 16", "After the quarter-finals", "They are never wiped"], a: 2, d: "easy" },
    { q: "Which country lost three World Cup Finals in 1974, 1978, and 2010?", o: ["Netherlands", "Argentina", "Hungary", "Italy"], a: 0, d: "medium" },
    { q: "Who is the only manager to lead three different national teams to the knockout stages of a World Cup?", o: ["Bora Milutinović", "Carlos Alberto Parreira", "Guus Hiddink", "Henri Michel"], a: 2, d: "medium" },
    { q: "Which team suffered the heaviest defeat in a single match in World Cup history?", o: ["El Salvador (vs Hungary, 1982)", "Zaire (vs Yugoslavia, 1974)", "Haiti (vs Poland, 1974)", "Saudi Arabia (vs Germany, 2002)"], a: 0, d: "hard" },
    { q: "Who was the first player in World Cup history to score goals for two different nations?", o: ["Robert Prosinečki", "László Kubala", "Alfredo Di Stéfano", "José Altafini"], a: 0, d: "expert" }
  ],
  day12: [
    { q: "Can a goalkeeper score a goal directly by throwing the ball with their hands into the opposing goal?", o: ["Yes, it counts", "No, a goal kick is awarded", "No, an indirect free kick is awarded", "No, a corner kick is awarded"], a: 1, d: "easy" },
    { q: "Which country hosted the 1986 tournament after Colombia declared they could not afford to host it?", o: ["Mexico", "Argentina", "Brazil", "USA"], a: 0, d: "medium" },
    { q: "Who was the top scorer of the 2002 FIFA World Cup?", o: ["Ronaldo Nazário", "Miroslav Klose", "Rivaldo", "Jon Dahl Tomasson"], a: 0, d: "medium" },
    { q: "Which nation holds the record for the most consecutive clean sheets in World Cup tournaments?", o: ["Switzerland", "Italy", "Brazil", "Germany"], a: 0, d: "hard" },
    { q: "In the 1930 World Cup Final, what unusual equipment dispute occurred before kick-off?", o: ["Both teams insisted on using their own match ball, so a different ball was used in each half", "Both teams refused to wear their away jerseys", "The boots used by Argentina were deemed illegal", "The goal nets were missing"], a: 0, d: "expert" }
  ],
  day13: [
    { q: "What does FIFA do if two teams are perfectly identical in points, goals, head-to-head, and fair play metrics in a group?", o: ["Drawing of lots", "A playoff match", "Coin toss by the captains", "A penalty shootout"], a: 0, d: "easy" },
    { q: "Which South American country did NOT qualify for the World Cup until 1998 but managed to reach the Round of 16?", o: ["Ecuador", "Paraguay", "Colombia", "Chile"], a: 2, d: "medium" },
    { q: "Who was the captain of the England squad that won the 1966 World Cup?", o: ["Bobby Moore", "Bobby Charlton", "Geoff Hurst", "Gordon Banks"], a: 0, d: "medium" },
    { q: "Which player has played the most minutes in World Cup history?", o: ["Lionel Messi", "Paolo Maldini", "Lothar Matthäus", "Diego Maradona"], a: 0, d: "hard" },
    { q: "Which referee famously issued three yellow cards to the same player (Josip Šimunić) in a 2006 World Cup match?", o: ["Graham Poll", "Horacio Elizondo", "Markus Merk", "Lubos Michel"], a: 0, d: "expert" }
  ],
  day14: [
    { q: "Under FIFA's updated rules, can a player who was substituted off the field receive a red card while sitting on the bench?", o: ["Yes", "No"], a: 0, d: "easy" },
    { q: "Which country has reached the semi-finals of a World Cup the most times without ever winning the tournament?", o: ["Netherlands", "Sweden", "Croatia", "Uruguay"], a: 0, d: "medium" },
    { q: "Who scored the iconic long-range goal for South Africa in the opening match of the 2010 World Cup?", o: ["Siphiwe Tshabalala", "Steven Pienaar", "Katlego Mphela", "Benni McCarthy"], a: 0, d: "medium" },
    { q: "Who is the youngest coach to ever manage a team at a FIFA World Cup?", o: ["Juan José Tramutola", "Lionel Scaloni", "Aliou Cissé", "Julian Nagelsmann"], a: 0, d: "hard" },
    { q: "Which country was banned from entering the 1994 World Cup qualifiers due to a goalkeeper faking an injury from a firework?", o: ["Chile", "Colombia", "Peru", "Bolivia"], a: 0, d: "expert" }
  ],
  day15: [
    { q: "What is the radius of the center circle on a standard FIFA World Cup pitch?", o: ["10 yards (9.15 meters)", "12 yards", "8 yards", "15 meters"], a: 0, d: "easy" },
    { q: "Which African nation became the first from the continent to win a World Cup group stage in 1986?", o: ["Morocco", "Algeria", "Cameroon", "Nigeria"], a: 0, d: "medium" },
    { q: "Who won the Best Young Player award at the 2010 World Cup?", o: ["Thomas Müller", "Mesut Özil", "James Rodríguez", "Sergio Busquets"], a: 0, d: "medium" },
    { q: "Which player has scored the most goals in World Cup history exclusively using headers?", o: ["Miroslav Klose", "Gerd Müller", "Pelé", "Cristiano Ronaldo"], a: 0, d: "hard" },
    { q: "What happened to the original Jules Rimet Trophy when it was on display in England before the 1966 World Cup?", o: ["It was stolen and later found by a dog named Pickles", "It was melted down by thieves", "It was accidentally dropped and broken", "It was lost at Heathrow airport"], a: 0, d: "expert" }
  ],
  day16: [
    { q: "When is a player considered in an offside position under FIFA rules?", o: ["When they are nearer to the opponents' goal line than both the ball and the second-last opponent", "When they are past the last defender completely", "When they are in the opponent's penalty box", "When they cross the midfield line before the ball"], a: 0, d: "easy" },
    { q: "Which nation has appeared in the most World Cup tournament finals without ever winning one?", o: ["Netherlands", "Hungary", "Czechoslovakia", "Sweden"], a: 0, d: "medium" },
    { q: "Who scored the winning penalty for Italy in the 2006 World Cup Final shootout?", o: ["Fabio Grosso", "Andrea Pirlo", "Alessandro Del Piero", "Francesco Totti"], a: 0, d: "medium" },
    { q: "Which country is the only one to have qualified for a World Cup via a drawing of lots after tying all qualification metrics?", o: ["Turkey (1954)", "Ireland (1990)", "Morocco (1970)", "Spain (1954)"], a: 0, d: "hard" },
    { q: "Who is the only player to score a hat-trick in a World Cup match and still end up on the losing side?", o: ["Ernst Wilimowski & Igor Belanov", "Josef Hügi", "Sandor Kocsis", "Cristiano Ronaldo"], a: 0, d: "expert" }
  ],
  day17: [
    { q: "During a World Cup penalty shootout, can a goalkeeper be replaced if they get injured?", o: ["Yes, provided the team has not used their maximum allowed substitutes or squad depth permits it", "No, an outfield player must take over", "No, shootouts cannot be halted for injuries", "Yes, any player from the stands can fill in"], a: 0, d: "easy" },
    { q: "Which team did Brazil defeat in the final to win their first-ever World Cup in 1958?", o: ["Sweden", "France", "West Germany", "Wales"], a: 0, d: "medium" },
    { q: "Who is the top goalscorer in World Cup history for England?", o: ["Gary Lineker", "Harry Kane", "Wayne Rooney", "Bobby Charlton"], a: 0, d: "medium" },
    { q: "Which stadium has hosted the most total World Cup matches across history?", o: ["Estadio Azteca", "Maracanã", "Wembley Stadium", "Olympiastadion Berlin"], a: 0, d: "hard" },
    { q: "What was the official name of the 2010 World Cup ball, which faced heavy criticism from goalkeepers for its unpredictable flight paths?", o: ["Jabulani", "Teamgeist", "Brazuca", "Fevernova"], a: 0, d: "expert" }
  ],
  day18: [
    { q: "According to the FIFA rules, if the ball hits a referee and stays on the pitch, does play always continue?", o: ["No, if it starts a promising attack, goes directly into the goal, or changes possession, a dropped ball is awarded", "Yes, the referee is always part of the pitch", "No, a free kick is awarded", "No, the play is restarted with a whistle throw"], a: 0, d: "easy" },
    { q: "Which nation was the first from Central America to qualify for a World Cup?", o: ["El Salvador", "Honduras", "Costa Rica", "Cuba"], a: 0, d: "medium" },
    { q: "Who was the manager of the Italian team during their 2006 World Cup triumph?", o: ["Marcello Lippi", "Arrigo Sacchi", "Giovanni Trapattoni", "Cesare Prandelli"], a: 0, d: "medium" },
    { q: "Which player holds the record for the most total fouls committed in a single World Cup match?", o: ["Diego Maradona (against him, 1982)", "Rigobert Song", "Gerardo Bedoya", "Claudio Gentile"], a: 3, d: "hard" },
    { q: "Which country is the only one to have won the World Cup while losing their opening match of the tournament?", o: ["Spain (2010)", "Argentina (2022)", "Italy (1982)", "Both Spain (2010) and Argentina (2022)"], a: 3, d: "expert" }
  ],
  day19: [
    { q: "What is the maximum width allowed for the goalposts and crossbar in FIFA tournament regulations?", o: ["12 cm (5 inches)", "15 cm", "10 cm", "8 cm"], a: 0, d: "easy" },
    { q: "Which European nation reached the World Cup finals twice in the 1930s but never won?", o: ["Czechoslovakia", "Hungary", "Austria", "Sweden"], a: 0, d: "medium" },
    { q: "Who was awarded the Golden Glove for the best goalkeeper at the 2014 FIFA World Cup?", o: ["Manuel Neuer", "Keylor Navas", "Sergio Romero", "Guillermo Ochoa"], a: 0, d: "medium" },
    { q: "Which country has recorded the most draws in World Cup tournament history?", o: ["Italy", "England", "Germany", "Brazil"], a: 0, d: "hard" },
    { q: "Who was the first active reigning monarch to officially open a FIFA World Cup tournament?", o: ["King George VI", "Queen Elizabeth II", "King Juan Carlos I", "Emperor Akihito"], a: 1, d: "expert" }
  ],
  day20: [
    { q: "True or False: If a player scores directly from a throw-in without the ball touching anyone else, it counts as a goal.", o: ["True", "False, a goal kick is awarded", "False, a corner kick is awarded", "False, the throw-in is retaken"], a: 1, d: "easy" },
    { q: "Which country failed to qualify for the 2018 World Cup despite having won the European Championships in 2016?", o: ["Netherlands", "Italy", "Portugal", "Greece"], a: 1, d: "medium" },
    { q: "Who scored the winning goal for Argentina in the 1978 World Cup Final against the Netherlands?", o: ["Mario Kempes", "Daniel Passarella", "Leopoldo Luque", "Jorge Olguín"], a: 0, d: "medium" },
    { q: "Which player holds the record for the longest gap between his first and last World Cup goals?", o: ["Lionel Messi", "Cristiano Ronaldo", "Pelé", "Miroslav Klose"], a: 0, d: "hard" },
    { q: "Which performance metric was used to eliminate Senegal in favor of Japan in the 2018 World Cup group stage?", o: ["Fair Play points (Yellow cards count)", "Drawing of lots", "Total shots on target", "Coin toss by FIFA officials"], a: 0, d: "expert" }
  ],
  day21: [
    { q: "What color kit must the match referees wear if both teams' kits clash with the standard black referee uniform?", o: ["An alternative color that contrasts with both teams (e.g., yellow, red, green)", "White only", "They must not change, teams must change", "Blue only"], a: 0, d: "easy" },
    { q: "Which country holds the record for the most goals scored against them in a single World Cup tournament?", o: ["South Korea (1954)", "El Salvador (1982)", "Zaire (1974)", "Saudi Arabia (2002)"], a: 0, d: "medium" },
    { q: "Who was the captain of the Spain team that won the 2010 World Cup?", o: ["Iker Casillas", "Carles Puyol", "Xavi Hernandez", "Andres Iniesta"], a: 0, d: "medium" },
    { q: "Which country became the first to reach three consecutive World Cup Finals twice?", o: ["Germany", "Brazil", "Italy", "Argentina"], a: 0, d: "hard" },
    { q: "Who is the only player to score in a World Cup Final, a European Cup/Champions League Final, and an Intercontinental Cup Final in the same season?", o: ["Gerd Müller", "Franz Beckenbauer", "Zinedine Zidane", "Paolo Rossi"], a: 0, d: "expert" }
  ],
  day22: [
    { q: "If a defender handles the ball deliberately on the goal line to prevent a goal, what is the referee's mandatory dual action?", o: ["Award a penalty and issue a red card", "Award a penalty and issue a yellow card", "Award an indirect free kick and a red card", "Award a penalty kick only"], a: 0, d: "easy" },
    { q: "Which Nordic nation made its first and only appearance in a World Cup final back in 1958?", o: ["Sweden", "Norway", "Denmark", "Finland"], a: 0, d: "medium" },
    { q: "Who won the Golden Boot at the 1998 World Cup in France?", o: ["Davor Šuker", "Ronaldo Nazário", "Gabriel Batistuta", "Thierry Henry"], a: 0, d: "medium" },
    { q: "Which player holds the record for the most individual goals scored during World Cup qualification stages overall?", o: ["Carlos Ruiz", "Cristiano Ronaldo", "Ali Daei", "Lionel Messi"], a: 0, d: "hard" },
    { q: "Which European country refused to play in the 1934 World Cup in Italy despite being the reigning champions?", o: ["Uruguay (South American, boycotted Europe)", "France", "England", "Spain"], a: 0, d: "expert" }
  ],
  day23: [
    { q: "Under FIFA's rules, what is the length of the break interval between normal time and the start of extra time?", o: ["5 minutes", "10 minutes", "15 minutes", "No break allowed"], a: 0, d: "easy" },
    { q: "Which nation won all of their qualifying matches and all of their tournament matches to win the 1970 World Cup?", o: ["Brazil", "Italy", "West Germany", "Uruguay"], a: 0, d: "medium" },
    { q: "Who was the manager of the Brazil team that won the 1994 World Cup?", o: ["Carlos Alberto Parreira", "Mário Zagallo", "Scolari", "Dunga"], a: 0, d: "medium" },
    { q: "Which nation has played the most World Cup matches without ever earning a single point?", o: ["El Salvador", "Canada", "Haiti", "Togo"], a: 0, d: "hard" },
    { q: "Who was the first player to be sent off in a World Cup match via a red card (after the physical card system was introduced)?", o: ["Carlos Caszely", "Plácido Galindo", "Rigobert Song", "Zinedine Zidane"], a: 0, d: "expert" }
  ],
  day24: [
    { q: "Can a player be called offside if they receive the ball directly from a standard throw-in?", o: ["Yes", "No"], a: 1, d: "easy" },
    { q: "Which country is the only one from Oceania to have qualified for the World Cup through the OFC confederation multiple times?", o: ["New Zealand", "Australia", "Fiji", "Tahiti"], a: 0, d: "medium" },
    { q: "Who won the Golden Ball at the 1990 FIFA World Cup?", o: ["Salvatore Schillaci", "Lothar Matthäus", "Diego Maradona", "Diego Forlán"], a: 0, d: "medium" },
    { q: "Which player has scored the most total goals in World Cup history without ever scoring a penalty?", o: ["Miroslav Klose", "Ronaldo", "Gerd Müller", "Pelé"], a: 0, d: "hard" },
    { q: "In 1938, which Asian nation qualified for the World Cup under the name 'Dutch East Indies'?", o: ["Indonesia", "Malaysia", "Suriname", "Philippines"], a: 0, d: "expert" }
  ],
  day25: [
    { q: "What happens if a ball bursts or becomes defective during a active World Cup match?", o: ["The match is stopped and restarted with a dropped ball using the replacement ball", "A throw-in is awarded", "The play continues until it goes out", "A bounce-off is held"], a: 0, d: "easy" },
    { q: "Which country was the first to win a World Cup outside of their own home continent?", o: ["Brazil (1958 in Europe)", "Argentina (1986 in North America)", "Germany (2014 in South America)", "Spain (2010 in Africa)"], a: 0, d: "medium" },
    { q: "Who scored Germany's extra-time winning goal against Argentina in the 2014 Final?", o: ["Mario Götze", "Thomas Müller", "Toni Kroos", "Miroslav Klose"], a: 0, d: "medium" },
    { q: "Which player has logged the most individual match wins in World Cup history?", o: ["Miroslav Klose", "Lionel Messi", "Cafu", "Ronaldo Nazário"], a: 0, d: "hard" },
    { q: "Which player holds the record for the longest suspension ever handed down for an on-field incident in World Cup history?", o: ["Luis Suárez (9 international matches, 2014)", "Mauro Tassotti (8 matches, 1994)", "Zinedine Zidane (3 matches, 2006)", "Leonardo (4 matches, 1994)"], a: 0, d: "expert" }
  ],
  day26: [
    { q: "If a player takes a free kick directly into their own team's goal without anyone else touching it, what is awarded?", o: ["A corner kick to the opposing team", "An own goal", "The free kick is retaken", "A penalty kick"], a: 0, d: "easy" },
    { q: "Which European nation finished third in both the 1974 and 1982 World Cups?", o: ["Poland", "France", "Sweden", "Austria"], a: 0, d: "medium" },
    { q: "Who was the captain of the France team during their 2018 World Cup victory?", o: ["Hugo Lloris", "Raphaël Varane", "Antoine Griezmann", "Paul Pogba"], a: 0, d: "medium" },
    { q: "Which individual has appeared in the most FIFA World Cup tournaments as a registered player?", o: ["6 players share the record with 5 tournaments (including Messi, Ronaldo, Guardado, Ochoa, Márquez, Matthäus)", "Lionel Messi exclusively", "Cristiano Ronaldo exclusively", "Lothar Matthäus exclusively"], a: 0, d: "hard" },
    { q: "Which World Cup tournament featured the fewest total matches played in its final tournament structure?", o: ["1930", "1934", "1938", "1950"], a: 0, d: "expert" }
  ],
  day27: [
    { q: "What is the mandatory height for all corner flags on a standard FIFA World Cup pitch?", o: ["Not less than 1.5 meters (5 feet)", "Exactly 1 meter", "Not less than 2 meters", "Exactly 1.2 meters"], a: 0, d: "easy" },
    { q: "Which team was the first to retain their World Cup title by winning consecutive tournaments?", o: ["Italy (1934, 1938)", "Brazil (1958, 1962)", "West Germany (1974, 1978)", "Argentina (1986, 1990)"], a: 0, d: "medium" },
    { q: "Who won the Golden Glove award at the 2006 World Cup?", o: ["Gianluigi Buffon", "Fabien Barthez", "Jens Lehmann", "Ricardo"], a: 0, d: "medium" },
    { q: "Which team holds the record for the most goals scored in a single match by one team in a World Cup Final?", o: ["Brazil (5 goals vs Sweden, 1958)", "Real Madrid", "West Germany", "France"], a: 0, d: "hard" },
    { q: "Which company has been the exclusive creator and provider of the official FIFA World Cup match balls since 1970?", o: ["Adidas", "Nike", "Puma", "Umbro"], a: 0, d: "expert" }
  ],
  day28: [
    { q: "True or False: A goal can be scored directly from a goal kick, but only against the opposing team.", o: ["True", "False, a dropped ball is needed", "False, it must touch a player first", "False, it results in an indirect free kick"], a: 0, d: "easy" },
    { q: "Which nation reached the quarter-finals in 2002, becoming the second African side to do so?", o: ["Senegal", "Cameroon", "Ghana", "Nigeria"], a: 0, d: "medium" },
    { q: "Who scored the famous winning goal for Uruguay against Brazil in the 1950 'Maracanazo' match?", o: ["Alcides Ghiggia", "Juan Alberto Schiaffino", "Obdulio Varela", "Omar Míguez"], a: 0, d: "medium" },
    { q: "Which country has played the most World Cup matches in history overall without winning a title?", o: ["Mexico", "Netherlands", "Sweden", "Belgium"], a: 0, d: "hard" },
    { q: "Who was the president of FIFA when the first World Cup tournament was inaugurated in 1930?", o: ["Jules Rimet", "Robert Guérin", "Daniel Burley Woolfall", "Rodolphe Seeldrayers"], a: 0, d: "expert" }
  ],
  day29: [
    { q: "According to the rules, can a player use their knees or thighs to pass the ball back to their goalkeeper to circumvent the backpass rule?", o: ["No, if it's a deliberate trick to flout the law, it is penalized with an indirect free kick and a caution", "Yes, it is perfectly legal", "Yes, but only outside the box", "No, it results in a penalty kick"], a: 0, d: "easy" },
    { q: "Which nation holds the record for the most consecutive qualifications for the World Cup without ever hosting it?", o: ["South Korea", "Spain", "Argentina", "Japan"], a: 0, d: "medium" },
    { q: "Who was the manager of the Argentina squad when they won the 1986 World Cup?", o: ["Carlos Bilardo", "César Luis Menotti", "Alfio Basile", "Diego Maradona"], a: 0, d: "medium" },
    { q: "Which player has scored the fastest hat-trick in World Cup history?", o: ["László Kiss (7 minutes, 1982)", "Gabriel Batistuta", "Gerd Müller", "Just Fontaine"], a: 0, d: "hard" },
    { q: "Which country was scheduled to play in the 1938 World Cup but withdrew because it was annexed by Nazi Germany shortly before the tournament?", o: ["Austria", "Czechoslovakia", "Poland", "Luxembourg"], a: 0, d: "expert" }
  ],
  day30: [
    { q: "If the match goes into extra time, are teams allowed to make an additional substitution beyond their standard allocation?", o: ["Yes, teams receive one additional substitution slot during extra time", "No, the substitution count is strictly fixed", "Yes, but only for the goalkeeper position", "Yes, up to two extra changes"], a: 0, d: "easy" },
    { q: "Which nation achieved the best performance ever by a North American (CONCACAF) side by reaching the semi-finals in 1930?", o: ["USA", "Mexico", "Cuba", "Costa Rica"], a: 0, d: "medium" },
    { q: "Who is the only player to score goals in two different World Cup Final match shootouts?", o: ["No player (Shootout goals do not count toward official match stats)", "Zinedine Zidane", "Lionel Messi", "Kylian Mbappé"], a: 0, d: "medium" },
    { q: "Which country has played in the most World Cup finals without winning a title?", o: ["Netherlands (3 times)", "Argentina", "Hungary", "Czechoslovakia"], a: 0, d: "hard" },
    { q: "What was unique about the selection of the Italian squad for the 1934 World Cup regarding player citizenship?", o: ["They utilized 'Oriundi' (South American players of Italian descent like Luis Monti)", "They used only players born in Rome", "They fielded an entirely amateur squad", "They had no coach"], a: 0, d: "expert" }
  ]
};

module.exports = dailyWorldCupQuiz;