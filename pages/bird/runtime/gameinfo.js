const screenWidth = window.innerWidth
const screenHeight = window.innerHeight


export default class GameInfo {
  renderGameScore(ctx, score,playerScore) {
    ctx.fillStyle = "#ffffff"
    ctx.font = "20px Arial"

    ctx.fillText(
      '上次得分：'+score,
      10,
      30
    )

    ctx.fillText(
      '得分：'+playerScore,
      10,
      60
    )
  }

}

