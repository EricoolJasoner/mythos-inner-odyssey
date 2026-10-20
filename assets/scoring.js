/*
 * MYTHOS scoring v1.
 * Narrative entertainment, not a validated psychological measurement.
 * Raw points determine the displayed order. Normalized values describe the
 * share of each archetype's available points; they are not probabilities.
 */
(function (root) {
  'use strict';

  function fail(message, code) {
    var error = new Error(message);
    error.code = code || 'INVALID_QUIZ_DATA';
    throw error;
  }

  function contribution(option, questionId, archetypeId) {
    if (questionId > 18) return option.primary === archetypeId ? 3 : 0;
    return (option.primary === archetypeId ? 2 : 0) +
      (option.secondary === archetypeId ? 1 : 0);
  }

  function sameRank(left, right) {
    return left.raw === right.raw && left.fate === right.fate;
  }

  function score(answers, questions, archetypes) {
    if (!Array.isArray(questions) || questions.length === 0) {
      fail('题目不能为空。');
    }
    if (!Array.isArray(archetypes) || archetypes.length < 2) {
      fail('至少需要两个原型。');
    }
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      fail('请完成全部题目后再查看结果。', 'INCOMPLETE_ANSWERS');
    }

    var ids = new Set();
    var table = new Map();
    archetypes.forEach(function (archetype, index) {
      if (!archetype || typeof archetype.id !== 'string' ||
          !archetype.id || ids.has(archetype.id)) {
        fail('原型编号必须为不重复的字符串。');
      }
      ids.add(archetype.id);
      table.set(archetype.id, {
        id: archetype.id,
        raw: 0,
        normalized: 0,
        fate: 0,
        primaryHits: 0,
        secondaryHits: 0,
        max: 0,
        expectedRandom: 0,
        primaryOpportunities: 0,
        secondaryOpportunities: 0,
        fateOpportunities: 0,
        displayOrder: index
      });
    });

    var questionIds = new Set();
    var evidence = [];
    questions.forEach(function (question, questionIndex) {
      if (!question || !Number.isInteger(question.id) ||
          question.id < 1 || question.id > 21 || questionIds.has(question.id)) {
        fail('题号必须为 1—21 之间不重复的整数。');
      }
      questionIds.add(question.id);
      if (!Array.isArray(question.options) || question.options.length < 2) {
        fail('每题至少需要两个选项。');
      }
      question.options.forEach(function (option) {
        if (!option || typeof option.text !== 'string' ||
            !ids.has(option.primary)) {
          fail('选项必须包含文案和有效的主要原型。');
        }
        if (question.id <= 18) {
          if (!ids.has(option.secondary) || option.secondary === option.primary) {
            fail('情境题必须包含两个不同的有效原型。');
          }
        } else if (option.secondary != null) {
          fail('命运题仅为一个原型加 3 分，不应包含次要原型。');
        }
      });

      var answer = answers[questionIndex];
      if (!Number.isInteger(answer) || answer < 0 ||
          answer >= question.options.length) {
        fail('第 ' + question.id + ' 题尚未选择有效答案。', 'INCOMPLETE_ANSWERS');
      }

      // A person can select only one option per question. Therefore a maximum
      // is the sum of per-question maxima, not the sum of all scoring slots.
      table.forEach(function (row) {
        var possible = question.options.map(function (option) {
          if (option.primary === row.id) {
            if (question.id > 18) row.fateOpportunities += 1;
            else row.primaryOpportunities += 1;
          }
          if (question.id <= 18 && option.secondary === row.id) {
            row.secondaryOpportunities += 1;
          }
          return contribution(option, question.id, row.id);
        });
        row.max += Math.max.apply(null, possible);
        row.expectedRandom += possible.reduce(function (sum, value) {
          return sum + value;
        }, 0) / possible.length;
      });

      var selected = question.options[answer];
      var primaryRow = table.get(selected.primary);
      var contributions;
      if (question.id > 18) {
        primaryRow.raw += 3;
        primaryRow.fate += 3;
        contributions = [{ id: selected.primary, points: 3, kind: 'fate' }];
      } else {
        primaryRow.raw += 2;
        primaryRow.primaryHits += 1;
        var secondaryRow = table.get(selected.secondary);
        secondaryRow.raw += 1;
        secondaryRow.secondaryHits += 1;
        contributions = [
          { id: selected.primary, points: 2, kind: 'primary' },
          { id: selected.secondary, points: 1, kind: 'secondary' }
        ];
      }
      evidence.push({
        questionId: question.id,
        questionText: question.text || question.title || question.question || '',
        optionIndex: answer,
        text: selected.text,
        primary: selected.primary,
        secondary: selected.secondary || null,
        kind: question.id > 18 ? 'fate' : 'scenario',
        contributions: contributions
      });
    });

    var ranked = Array.from(table.values()).map(function (row) {
      row.normalized = row.max ? Math.round(row.raw / row.max * 1000) / 10 : 0;
      row.expectedRandom = Math.round(row.expectedRandom * 1000) / 1000;
      return row;
    }).sort(function (left, right) {
      // displayOrder makes list rendering reproducible. It is NEVER a further
      // psychological tie breaker; unresolved leaders are explicitly returned.
      return right.raw - left.raw || right.fate - left.fate ||
        left.displayOrder - right.displayOrder;
    });

    var first = ranked[0];
    var topGroup = ranked.filter(function (row) { return sameRank(row, first); });
    var rawTieIds = ranked.filter(function (row) {
      return row.raw === first.raw;
    }).map(function (row) { return row.id; });
    var hasLeaderTie = topGroup.length > 1;
    var second = ranked[1];
    var secondaryGroup = ranked.slice(1).filter(function (row) {
      return sameRank(row, second);
    });
    var dualCandidates = ranked.filter(function (row) {
      return first.raw - row.raw <= 2;
    }).map(function (row) { return row.id; });

    return {
      ranked: ranked,
      primary: hasLeaderTie ? null : first.id,
      secondary: !hasLeaderTie && secondaryGroup.length === 1 ? second.id : null,
      dual: first.raw - second.raw <= 2,
      dualIds: dualCandidates.length === 2 ? dualCandidates : [],
      closeIds: dualCandidates,
      tiedIds: hasLeaderTie ? topGroup.map(function (row) { return row.id; }) : [],
      secondaryTiedIds: !hasLeaderTie && secondaryGroup.length > 1 ?
        secondaryGroup.map(function (row) { return row.id; }) : [],
      rawTieIds: rawTieIds.length > 1 ? rawTieIds : [],
      tieBreakUsed: !hasLeaderTie && rawTieIds.length > 1 ? 'fate' : null,
      evidence: evidence,
      total: ranked.reduce(function (sum, row) { return sum + row.raw; }, 0),
      answeredCount: answers.length,
      scoringVersion: '1.0.0',
      rankingMethod: 'raw-then-fate',
      normalizationMethod: 'raw / sum(per-question maximum) × 100',
      interpretation: {
        secondaryLabel: '次级倾向',
        normalizedLabel: '可得分占比',
        normalizedNote: '仅说明本次获得了该原型可得分数的多少；不是人格百分比、匹配概率或经过验证的测量。',
        tieNote: hasLeaderTie ? '最高分及命运题得分仍相同，本次不指定唯一主原型。' :
          '原始分相同先比较命运题分数；仍同分则保留并列。',
        closeNote: dualCandidates.length > 2 ?
          '有三个或更多原型相差不超过 2 分，本次呈现多种接近的倾向。' : '',
        lowScoreNote: '低分仅表示这次所选答案较少支持该原型，不能据此判断你与谁不合。'
      }
    };
  }

  var api = { score: score, version: '1.0.0' };
  root.MYTH_SCORING = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
}(typeof window !== 'undefined' ? window : globalThis));
