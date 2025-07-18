package com.jumpy.videoplayerapp;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ObjectAnimator;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.Button;
import android.widget.GridLayout;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;

import java.util.ArrayList;
import java.util.List;

public class ChessActivity extends AppCompatActivity {
    
    private GridLayout chessBoard;
    private TextView currentPlayerText;
    private TextView gameStatusText;
    private Button newGameButton;
    private Button undoButton;
    
    private ChessPiece[][] board;
    private boolean isWhiteTurn = true;
    private ChessPiece selectedPiece = null;
    private List<ChessMove> moveHistory;
    private boolean gameOver = false;
    private boolean whiteInCheck = false;
    private boolean blackInCheck = false;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chess);
        
        initializeViews();
        setupGame();
        updateUI();
    }
    
    private void initializeViews() {
        chessBoard = findViewById(R.id.chessBoard);
        currentPlayerText = findViewById(R.id.currentPlayerText);
        gameStatusText = findViewById(R.id.gameStatusText);
        newGameButton = findViewById(R.id.newGameButton);
        undoButton = findViewById(R.id.undoButton);
        
        newGameButton.setOnClickListener(v -> setupGame());
        undoButton.setOnClickListener(v -> undoLastMove());
        
        setupChessBoard();
    }
    
    private void setupChessBoard() {
        chessBoard.setColumnCount(8);
        chessBoard.setRowCount(8);
        
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                CardView square = createSquare(row, col);
                chessBoard.addView(square);
            }
        }
    }
    
    private CardView createSquare(int row, int col) {
        CardView square = new CardView(this);
        GridLayout.LayoutParams params = new GridLayout.LayoutParams();
        params.width = getSquareSize();
        params.height = getSquareSize();
        params.rowSpec = GridLayout.spec(row);
        params.columnSpec = GridLayout.spec(col);
        square.setLayoutParams(params);
        
        // Alternate colors
        boolean isLight = (row + col) % 2 == 0;
        square.setCardBackgroundColor(isLight ? Color.parseColor("#F0D9B5") : Color.parseColor("#B58863"));
        square.setRadius(0);
        square.setCardElevation(0);
        
        // Add click listener
        final int finalRow = row;
        final int finalCol = col;
        square.setOnClickListener(v -> onSquareClicked(finalRow, finalCol));
        
        return square;
    }
    
    private int getSquareSize() {
        int screenWidth = getResources().getDisplayMetrics().widthPixels;
        return (screenWidth - 32) / 8; // 32dp padding
    }
    
    private void setupGame() {
        board = new ChessPiece[8][8];
        moveHistory = new ArrayList<>();
        isWhiteTurn = true;
        gameOver = false;
        whiteInCheck = false;
        blackInCheck = false;
        
        // Setup pieces
        setupPieces();
        updateUI();
    }
    
    private void setupPieces() {
        // White pieces (bottom)
        board[7][0] = new ChessPiece(ChessPieceType.ROOK, true, 7, 0);
        board[7][1] = new ChessPiece(ChessPieceType.KNIGHT, true, 7, 1);
        board[7][2] = new ChessPiece(ChessPieceType.BISHOP, true, 7, 2);
        board[7][3] = new ChessPiece(ChessPieceType.QUEEN, true, 7, 3);
        board[7][4] = new ChessPiece(ChessPieceType.KING, true, 7, 4);
        board[7][5] = new ChessPiece(ChessPieceType.BISHOP, true, 7, 5);
        board[7][6] = new ChessPiece(ChessPieceType.KNIGHT, true, 7, 6);
        board[7][7] = new ChessPiece(ChessPieceType.ROOK, true, 7, 7);
        
        // White pawns
        for (int col = 0; col < 8; col++) {
            board[6][col] = new ChessPiece(ChessPieceType.PAWN, true, 6, col);
        }
        
        // Black pieces (top)
        board[0][0] = new ChessPiece(ChessPieceType.ROOK, false, 0, 0);
        board[0][1] = new ChessPiece(ChessPieceType.KNIGHT, false, 0, 1);
        board[0][2] = new ChessPiece(ChessPieceType.BISHOP, false, 0, 2);
        board[0][3] = new ChessPiece(ChessPieceType.QUEEN, false, 0, 3);
        board[0][4] = new ChessPiece(ChessPieceType.KING, false, 0, 4);
        board[0][5] = new ChessPiece(ChessPieceType.BISHOP, false, 0, 5);
        board[0][6] = new ChessPiece(ChessPieceType.KNIGHT, false, 0, 6);
        board[0][7] = new ChessPiece(ChessPieceType.ROOK, false, 0, 7);
        
        // Black pawns
        for (int col = 0; col < 8; col++) {
            board[1][col] = new ChessPiece(ChessPieceType.PAWN, false, 1, col);
        }
    }
    
    private void onSquareClicked(int row, int col) {
        if (gameOver) return;
        
        ChessPiece piece = board[row][col];
        
        // If no piece is selected and clicked square has a piece of current player's color
        if (selectedPiece == null && piece != null && piece.isWhite == isWhiteTurn) {
            selectedPiece = piece;
            highlightSquare(row, col, true);
            showValidMoves(piece);
        }
        // If a piece is selected and clicked square is a valid move
        else if (selectedPiece != null && isValidMove(selectedPiece, row, col)) {
            makeMove(selectedPiece, row, col);
            clearHighlights();
            selectedPiece = null;
        }
        // If clicked on a piece of the same color, select that piece instead
        else if (piece != null && piece.isWhite == isWhiteTurn) {
            clearHighlights();
            selectedPiece = piece;
            highlightSquare(row, col, true);
            showValidMoves(piece);
        }
        // Otherwise, deselect
        else {
            clearHighlights();
            selectedPiece = null;
        }
    }
    
    private void highlightSquare(int row, int col, boolean isSelected) {
        CardView square = (CardView) chessBoard.getChildAt(row * 8 + col);
        if (isSelected) {
            square.setCardBackgroundColor(Color.YELLOW);
        } else {
            boolean isLight = (row + col) % 2 == 0;
            square.setCardBackgroundColor(isLight ? Color.parseColor("#F0D9B5") : Color.parseColor("#B58863"));
        }
    }
    
    private void showValidMoves(ChessPiece piece) {
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                if (isValidMove(piece, row, col)) {
                    CardView square = (CardView) chessBoard.getChildAt(row * 8 + col);
                    square.setCardBackgroundColor(Color.GREEN);
                }
            }
        }
    }
    
    private void clearHighlights() {
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                highlightSquare(row, col, false);
            }
        }
    }
    
    private boolean isValidMove(ChessPiece piece, int toRow, int toCol) {
        if (piece == null) return false;
        
        // Check if destination has own piece
        ChessPiece destPiece = board[toRow][toCol];
        if (destPiece != null && destPiece.isWhite == piece.isWhite) {
            return false;
        }
        
        // Check piece-specific movement rules
        switch (piece.type) {
            case PAWN:
                return isValidPawnMove(piece, toRow, toCol);
            case ROOK:
                return isValidRookMove(piece, toRow, toCol);
            case KNIGHT:
                return isValidKnightMove(piece, toRow, toCol);
            case BISHOP:
                return isValidBishopMove(piece, toRow, toCol);
            case QUEEN:
                return isValidQueenMove(piece, toRow, toCol);
            case KING:
                return isValidKingMove(piece, toRow, toCol);
        }
        
        return false;
    }
    
    private boolean isValidPawnMove(ChessPiece pawn, int toRow, int toCol) {
        int direction = pawn.isWhite ? -1 : 1;
        int startRow = pawn.isWhite ? 6 : 1;
        
        // Forward move
        if (toCol == pawn.col && toRow == pawn.row + direction) {
            return board[toRow][toCol] == null;
        }
        
        // Initial two-square move
        if (toCol == pawn.col && toRow == pawn.row + 2 * direction && pawn.row == startRow) {
            return board[pawn.row + direction][toCol] == null && board[toRow][toCol] == null;
        }
        
        // Diagonal capture
        if (Math.abs(toCol - pawn.col) == 1 && toRow == pawn.row + direction) {
            return board[toRow][toCol] != null;
        }
        
        return false;
    }
    
    private boolean isValidRookMove(ChessPiece rook, int toRow, int toCol) {
        if (rook.row != toRow && rook.col != toCol) return false;
        
        int rowDir = Integer.compare(toRow, rook.row);
        int colDir = Integer.compare(toCol, rook.col);
        
        int currentRow = rook.row + rowDir;
        int currentCol = rook.col + colDir;
        
        while (currentRow != toRow || currentCol != toCol) {
            if (board[currentRow][currentCol] != null) return false;
            currentRow += rowDir;
            currentCol += colDir;
        }
        
        return true;
    }
    
    private boolean isValidKnightMove(ChessPiece knight, int toRow, int toCol) {
        int rowDiff = Math.abs(toRow - knight.row);
        int colDiff = Math.abs(toCol - knight.col);
        return (rowDiff == 2 && colDiff == 1) || (rowDiff == 1 && colDiff == 2);
    }
    
    private boolean isValidBishopMove(ChessPiece bishop, int toRow, int toCol) {
        if (Math.abs(toRow - bishop.row) != Math.abs(toCol - bishop.col)) return false;
        
        int rowDir = Integer.compare(toRow, bishop.row);
        int colDir = Integer.compare(toCol, bishop.col);
        
        int currentRow = bishop.row + rowDir;
        int currentCol = bishop.col + colDir;
        
        while (currentRow != toRow && currentCol != toCol) {
            if (board[currentRow][currentCol] != null) return false;
            currentRow += rowDir;
            currentCol += colDir;
        }
        
        return true;
    }
    
    private boolean isValidQueenMove(ChessPiece queen, int toRow, int toCol) {
        return isValidRookMove(queen, toRow, toCol) || isValidBishopMove(queen, toRow, toCol);
    }
    
    private boolean isValidKingMove(ChessPiece king, int toRow, int toCol) {
        int rowDiff = Math.abs(toRow - king.row);
        int colDiff = Math.abs(toCol - king.col);
        return rowDiff <= 1 && colDiff <= 1;
    }
    
    private void makeMove(ChessPiece piece, int toRow, int toCol) {
        // Store move for undo
        ChessMove move = new ChessMove(piece, piece.row, piece.col, toRow, toCol, board[toRow][toCol]);
        moveHistory.add(move);
        
        // Capture piece if any
        if (board[toRow][toCol] != null) {
            // Check if king was captured
            if (board[toRow][toCol].type == ChessPieceType.KING) {
                gameOver = true;
            }
        }
        
        // Move piece
        board[piece.row][piece.col] = null;
        board[toRow][toCol] = piece;
        piece.row = toRow;
        piece.col = toCol;
        
        // Check for pawn promotion
        if (piece.type == ChessPieceType.PAWN && (toRow == 0 || toRow == 7)) {
            piece.type = ChessPieceType.QUEEN;
        }
        
        // Switch turns
        isWhiteTurn = !isWhiteTurn;
        
        // Check for check/checkmate
        checkForCheck();
        
        updateUI();
        
        if (gameOver) {
            String winner = isWhiteTurn ? "Black" : "White";
            Toast.makeText(this, winner + " wins!", Toast.LENGTH_LONG).show();
        }
    }
    
    private void checkForCheck() {
        // Find kings
        ChessPiece whiteKing = null;
        ChessPiece blackKing = null;
        
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                ChessPiece piece = board[row][col];
                if (piece != null && piece.type == ChessPieceType.KING) {
                    if (piece.isWhite) {
                        whiteKing = piece;
                    } else {
                        blackKing = piece;
                    }
                }
            }
        }
        
        // Check if kings are in check
        whiteInCheck = isKingInCheck(whiteKing);
        blackInCheck = isKingInCheck(blackKing);
    }
    
    private boolean isKingInCheck(ChessPiece king) {
        if (king == null) return false;
        
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                ChessPiece piece = board[row][col];
                if (piece != null && piece.isWhite != king.isWhite) {
                    if (isValidMove(piece, king.row, king.col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    private void undoLastMove() {
        if (moveHistory.isEmpty()) return;
        
        ChessMove lastMove = moveHistory.remove(moveHistory.size() - 1);
        
        // Restore piece position
        board[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece;
        board[lastMove.fromRow][lastMove.fromCol] = lastMove.piece;
        lastMove.piece.row = lastMove.fromRow;
        lastMove.piece.col = lastMove.fromCol;
        
        // Restore piece type if it was promoted
        if (lastMove.piece.type == ChessPieceType.QUEEN && lastMove.piece.originalType == ChessPieceType.PAWN) {
            lastMove.piece.type = ChessPieceType.PAWN;
        }
        
        // Switch turns back
        isWhiteTurn = !isWhiteTurn;
        
        // Recheck for check
        checkForCheck();
        
        updateUI();
    }
    
    private void updateUI() {
        updateBoard();
        updateGameInfo();
        updateButtons();
    }
    
    private void updateBoard() {
        for (int row = 0; row < 8; row++) {
            for (int col = 0; col < 8; col++) {
                CardView square = (CardView) chessBoard.getChildAt(row * 8 + col);
                square.removeAllViews();
                
                ChessPiece piece = board[row][col];
                if (piece != null) {
                    ImageView pieceView = createPieceView(piece);
                    square.addView(pieceView);
                }
            }
        }
    }
    
    private ImageView createPieceView(ChessPiece piece) {
        ImageView pieceView = new ImageView(this);
        pieceView.setLayoutParams(new CardView.LayoutParams(
                getSquareSize() - 16, getSquareSize() - 16
        ));
        pieceView.setScaleType(ImageView.ScaleType.CENTER_INSIDE);
        
        // Set piece image based on type and color
        int resourceId = getPieceResourceId(piece);
        pieceView.setImageResource(resourceId);
        
        return pieceView;
    }
    
    private int getPieceResourceId(ChessPiece piece) {
        // In a real app, you'd have actual piece images
        // For now, we'll use text representation
        return android.R.drawable.ic_menu_help; // Placeholder
    }
    
    private void updateGameInfo() {
        String currentPlayer = isWhiteTurn ? "White" : "Black";
        currentPlayerText.setText(currentPlayer + "'s Turn");
        
        String status = "";
        if (gameOver) {
            status = "Game Over";
        } else if (whiteInCheck) {
            status = "White in Check";
        } else if (blackInCheck) {
            status = "Black in Check";
        } else {
            status = "Game in Progress";
        }
        
        gameStatusText.setText(status);
    }
    
    private void updateButtons() {
        undoButton.setEnabled(!moveHistory.isEmpty() && !gameOver);
        newGameButton.setEnabled(true);
    }
    
    private static class ChessPiece {
        ChessPieceType type;
        ChessPieceType originalType;
        boolean isWhite;
        int row, col;
        
        ChessPiece(ChessPieceType type, boolean isWhite, int row, int col) {
            this.type = type;
            this.originalType = type;
            this.isWhite = isWhite;
            this.row = row;
            this.col = col;
        }
    }
    
    private static class ChessMove {
        ChessPiece piece;
        int fromRow, fromCol;
        int toRow, toCol;
        ChessPiece capturedPiece;
        
        ChessMove(ChessPiece piece, int fromRow, int fromCol, int toRow, int toCol, ChessPiece capturedPiece) {
            this.piece = piece;
            this.fromRow = fromRow;
            this.fromCol = fromCol;
            this.toRow = toRow;
            this.toCol = toCol;
            this.capturedPiece = capturedPiece;
        }
    }
    
    private enum ChessPieceType {
        PAWN, ROOK, KNIGHT, BISHOP, QUEEN, KING
    }
} 