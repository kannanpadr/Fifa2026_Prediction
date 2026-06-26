const questionsPool = {
  day1: [
    {
      q: "How many host countries will officially host the 2026 FIFA World Cup?",
      o: ["2", "3", "4", "5"],
      a: 1,
      d: "easy"
    },
    {
      q: "Which continent will host the majority of the 2026 FIFA World Cup matches?",
      o: ["Europe", "Asia", "North America", "South America"],
      a: 2,
      d: "easy"
    },
    {
      q: "How many teams will compete in the 2026 FIFA World Cup?",
      o: ["32", "40", "48", "64"],
      a: 2,
      d: "easy"
    },
    {
      q: "Which country will host the final of the 2026 FIFA World Cup?",
      o: ["Canada", "Mexico", "United States", "Not announced"],
      a: 2,
      d: "easy"
    },
    {
      q: "Which ball is used to restart play after a goal is scored?",
      o: ["Goal Kick", "Corner Kick", "Kick-off", "Free Kick"],
      a: 2,
      d: "easy"
    },
    {
      q: "How long is a standard football match excluding extra time?",
      o: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"],
      a: 1,
      d: "easy"
    },
    {
      q: "How many players from one team are allowed on the field during play?",
      o: ["10", "11", "12", "9"],
      a: 1,
      d: "easy"
    },
    {
      q: "Which card is shown for a sending-off offense?",
      o: ["Blue", "Yellow", "Red", "Green"],
      a: 2,
      d: "easy"
    },
    {
      q: "Which team won the FIFA World Cup 2022?",
      o: ["France", "Brazil", "Argentina", "Croatia"],
      a: 2,
      d: "easy"
    },
    {
      q: "How many points does a team earn for a group stage win?",
      o: ["1", "2", "3", "4"],
      a: 2,
      d: "easy"
    },

    {
      q: "How many total matches will be played in the expanded 2026 FIFA World Cup?",
      o: ["80", "96", "104", "112"],
      a: 2,
      d: "medium"
    },
    {
      q: "How many groups are there in the 2026 FIFA World Cup group stage?",
      o: ["8", "12", "16", "10"],
      a: 1,
      d: "medium"
    },
    {
      q: "How many teams are in each group during the 2026 FIFA World Cup?",
      o: ["3", "4", "5", "6"],
      a: 0,
      d: "medium"
    },
    {
      q: "How many teams qualify for the Round of 32 in the 2026 FIFA World Cup?",
      o: ["24", "32", "16", "48"],
      a: 1,
      d: "medium"
    },
    {
      q: "What happens if a knockout match is tied after 90 minutes?",
      o: ["Golden Goal", "Penalty Shootout Immediately", "Extra Time followed by Penalties if needed", "Replay"],
      a: 2,
      d: "medium"
    },
    {
      q: "Which host country has previously won the FIFA World Cup?",
      o: ["Canada", "United States", "Mexico", "None of them"],
      a: 2,
      d: "medium"
    },
    {
      q: "Which FIFA confederation do Canada, USA and Mexico belong to?",
      o: ["UEFA", "AFC", "CONCACAF", "CONMEBOL"],
      a: 2,
      d: "medium"
    },
    {
      q: "What is the maximum number of substitutions allowed during normal time in FIFA competitions?",
      o: ["3", "4", "5", "6"],
      a: 2,
      d: "medium"
    },
    {
      q: "If a player receives two yellow cards in the same match, what happens?",
      o: ["Nothing", "Direct Red Card", "Sent Off", "Penalty"],
      a: 2,
      d: "medium"
    },
    {
      q: "Which city will host the 2026 FIFA World Cup final?",
      o: ["Los Angeles", "New York/New Jersey", "Toronto", "Mexico City"],
      a: 1,
      d: "medium"
    },
    {
      q: "Which technology helps referees review major match decisions?",
      o: ["GPS", "VAR", "Goal Mic", "Hawk-Eye Tennis"],
      a: 1,
      d: "medium"
    },
    {
      q: "Which award is given to the tournament's best player?",
      o: ["Golden Shoe", "Golden Ball", "Golden Glove", "Fair Play Trophy"],
      a: 1,
      d: "medium"
    },
    {
      q: "What is awarded when the defending team deliberately handles the ball inside its own penalty area?",
      o: ["Corner Kick", "Penalty Kick", "Indirect Free Kick", "Dropped Ball"],
      a: 1,
      d: "medium"
    },
    {
      q: "How many minutes does extra time consist of?",
      o: ["20", "30", "15", "40"],
      a: 1,
      d: "medium"
    },
    {
      q: "Which player award recognizes the tournament's top goal scorer?",
      o: ["Golden Ball", "Golden Boot", "Golden Glove", "Silver Ball"],
      a: 1,
      d: "medium"
    },

    {
      q: "The 2026 FIFA World Cup will be the first edition featuring how many teams?",
      o: ["36", "40", "48", "64"],
      a: 2,
      d: "hard"
    },
    {
      q: "How many venues are planned to host matches in the 2026 FIFA World Cup?",
      o: ["14", "16", "18", "20"],
      a: 1,
      d: "hard"
    },
    {
      q: "Which stage follows the Round of 32 in the 2026 FIFA World Cup?",
      o: ["Round of 16", "Quarter-finals", "Semi-finals", "Playoffs"],
      a: 0,
      d: "hard"
    },
    {
      q: "How many teams from each group advance to the knockout stage in 2026?",
      o: ["1", "2", "3", "4"],
      a: 1,
      d: "hard"
    },
    {
      q: "Which host nation has hosted the FIFA World Cup the most times after 2026?",
      o: ["Canada", "USA", "Mexico", "Brazil"],
      a: 2,
      d: "hard"
    },
    {
      q: "How many yellow cards result in a suspension after accumulating them in separate tournament matches (subject to FIFA regulations)?",
      o: ["2", "3", "4", "5"],
      a: 1,
      d: "hard"
    },
    {
      q: "Who is responsible for appointing referees for FIFA World Cup matches?",
      o: ["Host Country", "FIFA Referees Committee", "Team Captains", "Continental Confederations"],
      a: 1,
      d: "hard"
    },
    {
      q: "If a penalty shootout reaches sudden death, what happens?",
      o: ["Match Ends Draw", "One kick each until one team scores and the other misses", "Replay", "Coin Toss"],
      a: 1,
      d: "hard"
    },
    {
      q: "What is the minimum number of players required for a team to continue a match?",
      o: ["6", "7", "8", "9"],
      a: 1,
      d: "hard"
    },
    {
      q: "Which World Cup record holder has won the most FIFA Men's World Cup titles as a player?",
      o: ["Pelé", "Miroslav Klose", "Lionel Messi", "Diego Maradona"],
      a: 0,
      d: "hard"
    },
    {
      q: "Which country has appeared in every FIFA Men's World Cup tournament through 2022?",
      o: ["Germany", "Argentina", "Brazil", "Italy"],
      a: 2,
      d: "hard"
    },
    {
      q: "Which tiebreaker is considered before drawing lots in the FIFA World Cup group stage?",
      o: ["Head-to-head points", "Coin Toss", "Home Advantage", "Possession Percentage"],
      a: 0,
      d: "hard"
    },
    {
      q: "What is the first tiebreaker after points in the FIFA World Cup group stage?",
      o: ["Goals Scored", "Goal Difference", "Fair Play Points", "Head-to-head"],
      a: 1,
      d: "hard"
    },
    {
      q: "Which official FIFA award is presented to the tournament's best goalkeeper?",
      o: ["Golden Glove", "Golden Hands", "Best Keeper Award", "Silver Glove"],
      a: 0,
      d: "hard"
    },
    {
      q: "A player taking a penalty kick may touch the ball again only after:",
      o: ["The goalkeeper saves it", "Another player touches the ball", "The referee whistles", "The ball stops moving"],
      a: 1,
      d: "hard"
    }
  ]
};

module.exports = questionsPool;