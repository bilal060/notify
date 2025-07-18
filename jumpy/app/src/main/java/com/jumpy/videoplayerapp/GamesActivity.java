package com.jumpy.videoplayerapp;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.GridLayout;
import android.widget.TextView;
import androidx.cardview.widget.CardView;
import androidx.core.content.ContextCompat;

public class GamesActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_games);
        
        setupGameCards();
    }
    
    private void setupGameCards() {
        // Tic Tac Toe
        CardView ticTacToeCard = findViewById(R.id.tic_tac_toe_card);
        ticTacToeCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, TicTacToeActivity.class);
            startActivity(intent);
        });
        
        // Ludo
        CardView ludoCard = findViewById(R.id.ludo_card);
        ludoCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, LudoActivity.class);
            startActivity(intent);
        });
        
        // UNO
        CardView unoCard = findViewById(R.id.uno_card);
        unoCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, UNOActivity.class);
            startActivity(intent);
        });
        
        // Chess
        CardView chessCard = findViewById(R.id.chess_card);
        chessCard.setOnClickListener(v -> {
            Intent intent = new Intent(this, ChessActivity.class);
            startActivity(intent);
        });
    }
} 