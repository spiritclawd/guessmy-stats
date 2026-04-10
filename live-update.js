// Live data updater for guessMyNFT stats dashboard
// This script fetches real-time data from Cartridge Torii

const TORII_URL = 'https://api.cartridge.gg/x/guessnft-zk/torii/graphql';

async function updateLiveStats() {
  try {
    // Fetch game count
    const gamesRes = await fetch(TORII_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `{
          guessmynftGameModels(first: 300, order: { field: GAME_ID, direction: DESC }) {
            edges {
              node {
                game_id
                player1
                player2
                winner
                created_at
                collection_id
              }
            }
          }
        }`
      })
    });
    
    const gamesData = await gamesRes.json();
    const games = gamesData.data?.guessmynftGameModels?.edges || [];
    
    // Count unique players
    const players = new Set();
    let completed = 0;
    
    games.forEach(edge => {
      const g = edge.node;
      if (g.player1 && g.player1 !== '0x0') players.add(g.player1);
      if (g.player2 && g.player2 !== '0x0') players.add(g.player2);
      if (g.winner && g.winner !== '0x0') completed++;
    });
    
    // Update the displayed stats
    console.log('Live Stats Update:');
    console.log(`- Total Games: ${games.length}`);
    console.log(`- Unique Players: ${players.size}`);
    console.log(`- Completed Games: ${completed}`);
    
    // Latest game ID
    if (games.length > 0) {
      const latestId = parseInt(games[0].node.game_id, 16);
      console.log(`- Latest Game ID: ${latestId}`);
    }
    
    return {
      totalGames: games.length,
      uniquePlayers: players.size,
      completedGames: completed,
      latestGameId: games.length > 0 ? parseInt(games[0].node.game_id, 16) : 0
    };
    
  } catch (err) {
    console.error('Failed to fetch live stats:', err);
    return null;
  }
}

// Run on load
updateLiveStats().then(stats => {
  if (stats) {
    console.log('Stats fetched successfully:', stats);
  }
});