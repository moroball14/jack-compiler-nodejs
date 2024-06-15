import fs from "fs";

// contentの例
// <tokens>
// <keyword> class </keyword>
// <identifier> Main </identifier>
// <symbol> { </symbol>
// <keyword> static </keyword>
// <keyword> boolean </keyword>
// <identifier> test </identifier>
// <symbol> ; </symbol>
// <keyword> function </keyword>
// <keyword> void </keyword>
// <identifier> main </identifier>
// <symbol> ( </symbol>
// <symbol> ) </symbol>
// <symbol> { </symbol>
// <keyword> var </keyword>
// <identifier> SquareGame </identifier>
// <identifier> game </identifier>
// <symbol> ; </symbol>
// <keyword> let </keyword>
// <identifier> game </identifier>
// <symbol> = </symbol>
// <identifier> game </identifier>
// <symbol> ; </symbol>
// <keyword> do </keyword>
// <identifier> game </identifier>
// <symbol> . </symbol>
// <identifier> run </identifier>
// <symbol> ( </symbol>
// <symbol> ) </symbol>
// <symbol> ; </symbol>
// <keyword> do </keyword>
// <identifier> game </identifier>
// <symbol> . </symbol>
// <identifier> dispose </identifier>
// <symbol> ( </symbol>
// <symbol> ) </symbol>
// <symbol> ; </symbol>
// <keyword> return </keyword>
// <symbol> ; </symbol>
// <symbol> } </symbol>
// <keyword> function </keyword>
// <keyword> void </keyword>
// <identifier> more </identifier>
// <symbol> ( </symbol>
// <symbol> ) </symbol>
// <symbol> { </symbol>
// <keyword> var </keyword>
// <keyword> boolean </keyword>
// <identifier> b </identifier>
// <symbol> ; </symbol>
// <keyword> if </keyword>
// <symbol> ( </symbol>
// <identifier> b </identifier>
// <symbol> ) </symbol>
// <symbol> { </symbol>
// <symbol> } </symbol>
// <keyword> else </keyword>
// <symbol> { </symbol>
// <symbol> } </symbol>
// <keyword> return </keyword>
// <symbol> ; </symbol>
// <symbol> } </symbol>
// <symbol> } </symbol>
// </tokens>

const KEYWORDS = {
  static: "<keyword> static </keyword>",
  field: "<keyword> field </keyword>",
  function: "<keyword> function </keyword>",
  constructor: "<keyword> constructor </keyword>",
  method: "<keyword> method </keyword>",
  var: "<keyword> var </keyword>",
};

const SYMBOLS = {
  comma: "<symbol> , </symbol>",
  closeParen: "<symbol> ) </symbol>",
};

export class CompilationEngine {
  private readonly writeStream: fs.WriteStream;
  private tokens: string[];
  private indent: number = 0;
  private currentTokenIndex = 0;

  private constructor(args: { writeStream: fs.WriteStream; content: string }) {
    this.writeStream = args.writeStream;
    this.tokens = args.content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line !== "");
  }

  public static init(args: { content: string; writeStream: fs.WriteStream }) {
    return new CompilationEngine(args);
  }

  compileClass() {
    this.writeStream.write("<class>\n");
    this.plusIndent();
    this.plusIndex();
    this.writeCurrentLine();
    this.writeCurrentLine();
    this.writeCurrentLine();
    this.compileClassVarDec();
    this.compileSubroutineDec();
    this.writeCurrentLine(); // classの閉じタグが来る想定
    this.minusIndent();
    this.writeStream.write("</class>\n");
    this.writeStream.end();
  }

  private compileClassVarDec() {
    while (
      this.tokens[this.currentTokenIndex] === KEYWORDS.static ||
      this.tokens[this.currentTokenIndex] === KEYWORDS.field
    ) {
      this.writeStream.write(`${this.indentSpace()}<classVarDec>\n`);
      this.plusIndent();
      this.writeCurrentLine();
      this.writeCurrentLine();
      this.writeCurrentLine();
      while (this.tokens[this.currentTokenIndex] === SYMBOLS.comma) {
        this.writeCurrentLine();
        this.writeCurrentLine();
      }
      this.writeCurrentLine(); // ここが<symbol> ; </symbol>のはず
      this.minusIndent();
      this.writeStream.write(`${this.indentSpace()}</classVarDec>\n`);
    }
  }

  private compileSubroutineDec() {
    while (
      this.tokens[this.currentTokenIndex] === KEYWORDS.function ||
      this.tokens[this.currentTokenIndex] === KEYWORDS.method ||
      this.tokens[this.currentTokenIndex] === KEYWORDS.constructor
    ) {
      this.writeStream.write(`${this.indentSpace()}<subroutineDec>\n`);
      this.plusIndent();
      this.writeCurrentLine();
      this.writeCurrentLine();
      this.writeCurrentLine();
      this.writeCurrentLine(); // ここは ( が来るはず
      this.compileParameterList();
      this.writeCurrentLine(); // ここは ) が来るはず
      this.compileSubroutineBody();
      this.minusIndent();
      this.writeStream.write(`${this.indentSpace()}</subroutineDec>\n`);
    }
  }

  private compileParameterList() {
    this.writeStream.write(`${this.indentSpace()}<parameterList>\n`);
    this.plusIndent();
    while (this.tokens[this.currentTokenIndex] !== SYMBOLS.closeParen) {
      this.writeCurrentLine();
      this.writeCurrentLine();
      if (this.tokens[this.currentTokenIndex] === SYMBOLS.comma) {
        this.writeCurrentLine();
      }
    }
    this.minusIndent();
    this.writeStream.write(`${this.indentSpace()}</parameterList>\n`);
  }

  private compileSubroutineBody() {
    this.writeStream.write(`${this.indentSpace()}<subroutineBody>\n`);
    this.plusIndent();
    this.writeCurrentLine(); // { が来るはず
    this.compileVarDec();
    this.compileStatements();
    this.writeCurrentLine(); // } が来るはず
    this.minusIndent();
    this.writeStream.write(`${this.indentSpace()}</subroutineBody>\n`);
  }

  private compileVarDec() {
    while (this.tokens[this.currentTokenIndex] === KEYWORDS.var) {
      this.writeStream.write(`${this.indentSpace()}<varDec>\n`);
      this.plusIndent();
      this.writeCurrentLine();
      this.writeCurrentLine();
      this.writeCurrentLine();
      while (this.tokens[this.currentTokenIndex] === SYMBOLS.comma) {
        this.writeCurrentLine();
        this.writeCurrentLine();
      }
      this.writeCurrentLine(); // ここが<symbol> ; </symbol>のはず
      this.minusIndent();
      this.writeStream.write(`${this.indentSpace()}</varDec>\n`);
    }
  }

  private compileStatements() {
    // implement
  }

  private plusIndent() {
    this.indent += 2;
  }

  private minusIndent() {
    this.indent -= 2;
  }

  private indentSpace() {
    return " ".repeat(this.indent);
  }

  private plusIndex() {
    this.currentTokenIndex++;
  }

  private writeCurrentLine() {
    this.writeStream.write(
      `${this.indentSpace()}${this.tokens[this.currentTokenIndex]}\n`
    );
    this.plusIndex();
  }
}
