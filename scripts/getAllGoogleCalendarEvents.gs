/**
 * 今日の予定を取得し、参加ステータスでフィルタリングして返す関数
 * @param {string} date - 日付パラメータ（現在は未使用、常に今日の予定を取得）
 * @returns {Array} 参加予定のイベント配列（開始時刻、終了時刻、タイトル）
 */
function getAllMaskedEvents(date) {
  // 全てのアクセス可能なカレンダーを取得
  const calendars = CalendarApp.getAllCalendars();
  
  // 今日の日付を設定（パラメータのdateは現在未使用）
  const targetDate = new Date();
  
  // 全てのイベントを格納する配列
  let allEvents = [];
  
  // 各カレンダーを順次処理
  calendars.forEach(calendar => {
    try {
      // 対象日の予定を取得
      const events = calendar.getEventsForDay(targetDate);
      
      // 参加ステータスでフィルタリング後、必要な情報のみ抽出
      const maskedEvents = events
        .filter(event => {
          // 参加ステータスをチェックして、含めるかどうかを判定
          try {
            // 自分が主催者かどうかを確認
            const isOwner = event.isOwnedByMe();
            // 自分の参加ステータスを取得
            const myStatus = event.getMyStatus();
            
            // 主催者の場合は必ず含める
            if (isOwner) {
              return true;
            }
            
            // 招待された予定の場合：「参加」と回答した予定のみ含める
            return myStatus === CalendarApp.GuestStatus.YES;
            
            // 除外される予定：
            // - CalendarApp.GuestStatus.NO (不参加)
            // - CalendarApp.GuestStatus.MAYBE (仮参加) ※コメントアウト中
            // - CalendarApp.GuestStatus.INVITED (未回答) ※コメントアウト中
            
          } catch (error) {
            // 参加ステータスが取得できない場合のエラーハンドリング
            console.log(`参加ステータス取得エラー: ${error}`);
            return true; // エラー時は安全のため含める
          }
        })
        .map(event => {
          // 必要な情報のみを抽出してオブジェクトを作成
          return {
            start: event.getStartTime().toISOString(), // 開始時刻（ISO形式）
            end: event.getEndTime().toISOString(),     // 終了時刻（ISO形式）
            title: event.getTitle()                    // 予定のタイトル（原文のまま）
          };
        });
      
      // フィルタリング済みの予定を全体の配列に追加
      allEvents = allEvents.concat(maskedEvents);
      
    } catch (error) {
      // カレンダーアクセスエラーのハンドリング
      console.log(`カレンダー ${calendar.getName()} の取得でエラー: ${error}`);
    }
  });
  
  // デバッグ用：取得した予定を全て出力
  console.log(allEvents);
  
  // 参加予定のイベント配列を返す
  return allEvents;
}

/**
 * 参加ステータスの説明:
 * - CalendarApp.GuestStatus.OWNER: 主催者
 * - CalendarApp.GuestStatus.YES: 参加
 * - CalendarApp.GuestStatus.MAYBE: 仮参加
 * - CalendarApp.GuestStatus.NO: 不参加
 * - CalendarApp.GuestStatus.INVITED: 未回答
 */

/**
 * 使用例:
 * const todayEvents = getAllMaskedEvents();
 * console.log(`今日の参加予定: ${todayEvents.length}件`);
 */
