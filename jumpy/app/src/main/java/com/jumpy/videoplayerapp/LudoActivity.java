package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.ImageView;
import android.widget.Toast;
import java.util.Random;

public class LudoActivity extends Activity {
    
    private TextView statusText;
    private Button rollDiceButton;
    private Button resetButton;
    private ImageView diceImage;
    private TextView player1Score, player2Score, player3Score, player4Score;
    private int currentPlayer = 1;
    private int[] playerPositions = {0, 0, 0, 0};
    private boolean gameActive = true;
    private Random random = new Random();
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ludo);
        
        initializeViews();
        setupGame();
    }
    
    private void initializeViews() {
        statusText = findViewById(R.id.status_text);
        rollDiceButton = findViewById(R.id.roll_dice_button);
        resetButton = findViewById(R.id.reset_button);
        diceImage = findViewById(R.id.dice_image);
        player1Score = findViewById(R.id.player1_score);
        player2Score = findViewById(R.id.player2_score);
        player3Score = findViewById(R.id.player3_score);
        player4Score = findViewById(R.id.player4_score);
    }
    
    private void setupGame() {
        rollDiceButton.setOnClickListener(v -> rollDice());
        resetButton.setOnClickListener(v -> resetGame());
        
        updateStatusText();
        updateScores();
    }
    
    private void rollDice() {
        if (!gameActive) return;
        
        // Disable button during roll
        rollDiceButton.setEnabled(false);
        
        // Animate dice roll
        int diceValue = random.nextInt(6) + 1;
        
        // Update dice image
        updateDiceImage(diceValue);
        
        // Move player
        movePlayer(diceValue);
        
        // Check for win
        if (checkForWin()) {
            gameActive = false;
            String winner = "Player " + currentPlayer;
            statusText.setText(winner + " wins!");
            Toast.makeText(this, winner + " wins the game!", Toast.LENGTH_LONG).show();
        } else {
            // Next player
            currentPlayer = (currentPlayer % 4) + 1;
            updateStatusText();
        }
        
        // Re-enable button
        rollDiceButton.setEnabled(true);
    }
    
    private void updateDiceImage(int value) {
        // In a real app, you'd have actual dice images
        // For now, we'll just show the number
        diceImage.setImageResource(getDiceResource(value));
    }
    
    private int getDiceResource(int value) {
        // Placeholder - in real app, you'd have actual dice drawables
        switch (value) {
            case 1: return R.drawable.dice_1;
            case 2: return R.drawable.dice_2;
            case 3: return R.drawable.dice_3;
            case 4: return R.drawable.dice_4;
            case 5: return R.drawable.dice_5;
            case 6: return R.drawable.dice_6;
            default: return R.drawable.dice_1;
        }
    }
    
    private void movePlayer(int steps) {
        playerPositions[currentPlayer - 1] += steps;
        
        // Keep within board limits (simplified)
        if (playerPositions[currentPlayer - 1] > 100) {
            playerPositions[currentPlayer - 1] = 100;
        }
        
        updateScores();
        
        Toast.makeText(this, "Player " + currentPlayer + " moved " + steps + " steps", Toast.LENGTH_SHORT).show();
    }
    
    private boolean checkForWin() {
        for (int i = 0; i < 4; i++) {
            if (playerPositions[i] >= 100) {
                return true;
            }
        }
        return false;
    }
    
    private void updateStatusText() {
        String status = "Player " + currentPlayer + "'s turn";
        statusText.setText(status);
    }
    
    private void updateScores() {
        player1Score.setText("Player 1: " + playerPositions[0]);
        player2Score.setText("Player 2: " + playerPositions[1]);
        player3Score.setText("Player 3: " + playerPositions[2]);
        player4Score.setText("Player 4: " + playerPositions[3]);
    }
    
    private void resetGame() {
        for (int i = 0; i < 4; i++) {
            playerPositions[i] = 0;
        }
        currentPlayer = 1;
        gameActive = true;
        updateStatusText();
        updateScores();
        diceImage.setImageResource(R.drawable.dice_1);
    }
} 