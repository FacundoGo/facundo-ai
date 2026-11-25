/* facundo.ai — real cost per usable AI clip.
   Usable clip = list price per second × seconds × attempts per keeper.
   Month = usable clip × clips per week × 52/12.
   The page supplies the rates. This file only does the arithmetic. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.videoCost = api;
  if (typeof document !== 'undefined') api.mount(document);
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var WEEKS_PER_MONTH = 52 / 12;

  function formatUsd(n) {
    if (!isFinite(n)) return '\u2014';
    var neg = n < 0;
    var abs = Math.abs(n);
    if (abs === 0) return '$0';
    var digits = abs < 0.01 ? 4 : 2;
    var fixed = abs.toFixed(digits);
    if (Number(fixed) === 0) return '$0';
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '-$' : '$') + parts.join('.');
  }

  function plain(n) {
    if (!isFinite(n)) return '\u2014';
    return String(Math.round(n * 1000) / 1000);
  }

  function formatRate(n) {
    if (!isFinite(n)) return '\u2014';
    var s = n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
    return '$' + s + '/s';
  }

  function compute(rate, seconds, attempts, weekly) {
    if (!isFinite(rate) || rate < 0) return null;
    if (!isFinite(seconds) || seconds <= 0) return null;
    if (!isFinite(attempts) || attempts < 1) return null;
    if (!isFinite(weekly) || weekly < 0) return null;
    var list = rate * seconds;
    var real = list * attempts;
    return {
      list: list,
      real: real,
      month: real * weekly * WEEKS_PER_MONTH
    };
  }

  function mount(doc) {
    var form = doc.getElementById('video-cost');
    if (!form) return;
    var secondsEl = doc.getElementById('clip-seconds');
    var attemptsEl = doc.getElementById('clip-attempts');
    var weeklyEl = doc.getElementById('clip-weekly');
    var customEl = doc.getElementById('clip-custom');
    var customLabel = doc.getElementById('custom-price-label');
    var outList = doc.getElementById('out-list');
    var outReal = doc.getElementById('out-real');
    var outMonth = doc.getElementById('out-month');
    var noteList = doc.getElementById('note-list');
    var noteReal = doc.getElementById('note-real');
    var noteMonth = doc.getElementById('note-month');
    if (!secondsEl || !outList || !outReal || !outMonth) return;

    function selected() {
      return form.querySelector('input[name="preset"]:checked');
    }

    function read(el) {
      if (!el || String(el.value).trim() === '') return NaN;
      return parseFloat(el.value);
    }

    function render() {
      var chosen = selected();
      var custom = !!(chosen && chosen.getAttribute('data-custom') === 'true');
      if (customLabel) customLabel.hidden = !custom;

      var rate = NaN;
      var rateLabel = '\u2014';
      if (custom) {
        rate = read(customEl);
        rateLabel = formatRate(rate);
      } else if (chosen) {
        var raw = chosen.getAttribute('data-rate');
        rate = raw === null || raw === '' ? NaN : parseFloat(raw);
        var rateNode = chosen.parentNode && chosen.parentNode.querySelector('.preset-rate');
        rateLabel = rateNode ? rateNode.textContent : formatRate(rate);
      }

      var seconds = read(secondsEl);
      var attempts = read(attemptsEl);
      var weekly = read(weeklyEl);
      var result = compute(rate, seconds, attempts, weekly);

      if (!result) {
        outList.textContent = '\u2014';
        outReal.textContent = '\u2014';
        outMonth.textContent = '\u2014';
        if (noteList) noteList.textContent = 'Needs a length above 0, a price, and at least 1 attempt.';
        if (noteReal) noteReal.textContent = '';
        if (noteMonth) noteMonth.textContent = '';
        return;
      }

      outList.textContent = formatUsd(result.list);
      outReal.textContent = formatUsd(result.real);
      outMonth.textContent = formatUsd(result.month);
      if (noteList) noteList.textContent = rateLabel + ' \u00d7 ' + plain(seconds) + 's';
      if (noteReal) noteReal.textContent = 'list price \u00d7 ' + plain(attempts) + (attempts === 1 ? ' attempt' : ' attempts');
      if (noteMonth) noteMonth.textContent = plain(weekly) + (weekly === 1 ? ' clip/week' : ' clips/week') + ' \u00d7 52/12';
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      render();
    });
    render();
  }

  return {
    WEEKS_PER_MONTH: WEEKS_PER_MONTH,
    formatUsd: formatUsd,
    formatRate: formatRate,
    compute: compute,
    mount: mount
  };
});
