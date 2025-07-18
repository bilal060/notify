package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.GridLayout;
import android.widget.Toast;
import java.util.Random;

public class TicTacToeActivity extends Activity {
    
    private Button[][] buttons = new Button[3][3];
    private boolean playerXTurn = true;
    private int roundCount = 0;
    private TextView statusText;
    private Button resetButton;
    private boolean gameActive = true;
    private String playerX = "X";
    private String playerO = "O";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tic_tac_toe);
        
        statusText = findViewById(R.id.status_text);
        resetButton = findViewById(R.id.reset_button);
        
        // Initialize game board
        initializeBoard();
        
        // Setup reset button
        resetButton.setOnClickListener(v -> resetGame());
        
        updateStatusText();
    }
    
    private void initializeBoard() {
        GridLayout gridLayout = findViewById(R.id.game_grid);
        
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                String buttonID = "button_" + i + j;
                int resID = getResources().getIdentifier(buttonID, "id", getPackageName());
                buttons[i][j] = findViewById(resID);
                
                buttons[i][j].setOnClickListener(v -> onCellClicked((Button) v));
            }
        }
    }
    
    private void onCellClicked(Button button) {
        if (!gameActive || !button.getText().toString().equals("")) {
            return;
        }
        
        // Player move
        button.setText(playerXTurn ? playerX : playerO);
        button.setTextColor(playerXTurn ? 0xFFE74C3C : 0xFF3498DB);
        roundCount++;
        
        if (checkForWin()) {
            gameActive = false;
            String winner = playerXTurn ? "Player X" : "Player O";
            statusText.setText(winner + " wins!");
            Toast.makeText(this, winner + " wins!", Toast.LENGTH_LONG).show();
        } else if (roundCount == 9) {
            gameActive = false;
            statusText.setText("It's a draw!");
            Toast.makeText(this, "It's a draw!", Toast.LENGTH_LONG).show();
        } else {
            playerXTurn = !playerXTurn;
            updateStatusText();
            
            // AI move (if playing against computer)
            if (!playerXTurn) {
                makeAIMove();
            }
        }
    }
    
    private void makeAIMove() {
        // Simple AI: find empty cell and place O
        Random random = new Random();
        int row, col;
        
        do {
            row = random.nextInt(3);
            col = random.nextInt(3);
        } while (!buttons[row][col].getText().toString().equals(""));
        
        buttons[row][col].setText(playerO);
        buttons[row][col].setTextColor(0xFF3498DB);
        roundCount++;
        
        if (checkForWin()) {
            gameActive = false;
            statusText.setText("Computer wins!");
            Toast.makeText(this, "Computer wins!", Toast.LENGTH_LONG).show();
        } else if (roundCount == 9) {
            gameActive = false;
            statusText.setText("It's a draw!");
            Toast.makeText(this, "It's a draw!", Toast.LENGTH_LONG).show();
        } else {
            playerXTurn = true;
            updateStatusText();
        }
    }
    
    private boolean checkForWin() {
        String[][] field = new String[3][3];
        
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                field[i][j] = buttons[i][j].getText().toString();
            }
        }
        
        // Check rows
        for (int i = 0; i < 3; i++) {
            if (field[i][0].equals(field[i][1]) && field[i][0].equals(field[i][2]) && !field[i][0].equals("")) {
                return true;
            }
        }
        
        // Check columns
        for (int i = 0; i < 3; i++) {
            if (field[0][i].equals(field[1][i]) && field[0][i].equals(field[2][i]) && !field[0][i].equals("")) {
                return true;
            }
        }
        
        // Check diagonals
        if (field[0][0].equals(field[1][1]) && field[0][0].equals(field[2][2]) && !field[0][0].equals("")) {
            return true;
        }
        
        if (field[0][2].equals(field[1][1]) && field[0][2].equals(field[2][0]) && !field[0][2].equals("")) {
            return true;
        }
        
        return false;
    }
    
    private void updateStatusText() {
        String status = playerXTurn ? "Player X's turn" : "Player O's turn";
        statusText.setText(status);
    }
    
    private void resetGame() {
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                buttons[i][j].setText("");
            }
        }
        
        roundCount = 0;
        playerXTurn = true;
        gameActive = true;
        updateStatusText();
    }
} 