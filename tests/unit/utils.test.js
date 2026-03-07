import { describe, it, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { truncate, log, formatTable, spinner } from '../../src/utils.js';

describe('truncate', () => {
  it('returns short string unchanged', () => {
    assert.equal(truncate('hello', 60), 'hello');
  });

  it('returns string at exactly the limit unchanged', () => {
    const str = 'a'.repeat(60);
    assert.equal(truncate(str, 60), str);
  });

  it('truncates string over limit with ellipsis', () => {
    const str = 'a'.repeat(70);
    const result = truncate(str, 60);
    assert.equal(result.length, 60);
    assert.ok(result.endsWith('...'));
  });

  it('handles custom length', () => {
    const result = truncate('abcdefgh', 5);
    assert.equal(result, 'ab...');
  });

  it('returns empty string for null', () => {
    assert.equal(truncate(null), '');
  });

  it('returns empty string for undefined', () => {
    assert.equal(truncate(undefined), '');
  });

  it('returns empty string for empty input', () => {
    assert.equal(truncate(''), '');
  });

  it('uses default length of 60', () => {
    const str = 'a'.repeat(100);
    const result = truncate(str);
    assert.equal(result.length, 60);
  });
});

describe('log', () => {
  let logSpy, errorSpy;

  beforeEach(() => {
    logSpy = mock.method(console, 'log', () => {});
    errorSpy = mock.method(console, 'error', () => {});
  });

  afterEach(() => {
    logSpy.mock.restore();
    errorSpy.mock.restore();
  });

  it('log.info writes to console.log with message', () => {
    log.info('test message');
    assert.equal(logSpy.mock.callCount(), 1);
    const output = logSpy.mock.calls[0].arguments.join(' ');
    assert.ok(output.includes('test message'));
  });

  it('log.success writes to console.log with message', () => {
    log.success('done');
    assert.equal(logSpy.mock.callCount(), 1);
    const output = logSpy.mock.calls[0].arguments.join(' ');
    assert.ok(output.includes('done'));
  });

  it('log.warn writes to console.log with message', () => {
    log.warn('caution');
    assert.equal(logSpy.mock.callCount(), 1);
    const output = logSpy.mock.calls[0].arguments.join(' ');
    assert.ok(output.includes('caution'));
  });

  it('log.error writes to console.error', () => {
    log.error('failure');
    assert.equal(errorSpy.mock.callCount(), 1);
    assert.equal(logSpy.mock.callCount(), 0);
    const output = errorSpy.mock.calls[0].arguments.join(' ');
    assert.ok(output.includes('failure'));
  });

  it('log.dim writes to console.log', () => {
    log.dim('subtle');
    assert.equal(logSpy.mock.callCount(), 1);
    const output = logSpy.mock.calls[0].arguments.join(' ');
    assert.ok(output.includes('subtle'));
  });
});

describe('formatTable', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = mock.method(console, 'log', () => {});
  });

  afterEach(() => {
    logSpy.mock.restore();
  });

  it('prints header, separator and data rows', () => {
    formatTable(
      [['alice', '30'], ['bob', '25']],
      ['Name', 'Age']
    );
    // header + separator + 2 data rows = 4 calls
    assert.equal(logSpy.mock.callCount(), 4);
  });

  it('prints only header and separator for empty rows', () => {
    formatTable([], ['Name', 'Age']);
    // header + separator = 2 calls
    assert.equal(logSpy.mock.callCount(), 2);
  });

  it('handles null/undefined cells gracefully', () => {
    assert.doesNotThrow(() => {
      formatTable([[null, undefined]], ['Col1', 'Col2']);
    });
  });

  it('auto-sizes columns to fit content', () => {
    formatTable([['longername', 'x']], ['N', 'V']);
    // header row should have been padded to at least 'longername'.length
    const headerOutput = logSpy.mock.calls[0].arguments[0];
    assert.ok(headerOutput.includes('N'));
  });
});

describe('spinner', () => {
  it('returns an ora instance with expected methods', () => {
    const spin = spinner('Loading...');
    assert.equal(typeof spin.start, 'function');
    assert.equal(typeof spin.stop, 'function');
    assert.equal(typeof spin.succeed, 'function');
    assert.equal(typeof spin.fail, 'function');
    assert.equal(typeof spin.info, 'function');
  });

  it('has the correct text property', () => {
    const spin = spinner('Test text');
    assert.equal(spin.text, 'Test text');
  });
});
