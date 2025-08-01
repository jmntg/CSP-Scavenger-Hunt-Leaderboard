class TeamDashboard {
    constructor() {
        this.spreadsheetId = '1jL_LruiWD43MGIAWaCqcPTQohj1Zn5rrAkyP_p6Qqt4';
        this.range = 'E1:I2';
        this.teams = [];
        this.init();
    }

    async init() {
        this.updateLastUpdateTime();
        await this.fetchSpreadsheetData();
        this.renderTeamList();
        setInterval(() => this.updateLastUpdateTime(), 1000);
        setInterval(() => this.fetchSpreadsheetData(), 5000);
    }

    async fetchSpreadsheetData() {
        try {
            const url = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/gviz/tq?tqx=out:csv&range=${this.range}`;
            const response = await fetch(url);
            const csvText = await response.text();
            
            const lines = csvText.trim().split('\n');
            if (lines.length >= 2) {
                const teamNames = lines[0].split(',').map(name => name.replace(/"/g, '').trim());
                const teamPoints = lines[1].split(',').map(points => parseInt(points.replace(/"/g, '').trim()) || 0);
                
                this.teams = teamNames.map((name, index) => ({
                    name: name || `Team ${index + 1}`,
                    points: teamPoints[index] || 0
                }));
                
                this.sortTeams();
                this.renderTeamList();
            }
        } catch (error) {
            console.error('Error fetching spreadsheet data:', error);
            document.getElementById('lastUpdate').textContent = 'Error loading data';
        }
    }

    sortTeams() {
        this.teams.sort((a, b) => b.points - a.points);
    }

    renderTeamList() {
        const container = document.getElementById('teamList');
        if (!container) return;

        container.innerHTML = '';
        
        if (this.teams.length === 0) {
            container.innerHTML = '<div class="loading">Loading team data...</div>';
            return;
        }
        
        this.teams.forEach((team, index) => {
            const percentage = Math.min((team.points / 920) * 100, 100);
            const teamElement = document.createElement('div');
            teamElement.className = 'team-item';
            teamElement.innerHTML = `
                <div class="team-progress-bg">
                    <div class="team-progress-fill" style="width: ${percentage}%"></div>
                    <div class="team-content">
                        <div class="team-rank">#${index + 1}</div>
                        <div class="team-info">
                            <div class="team-name">${team.name}</div>
                            <div class="team-points">${team.points} points</div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(teamElement);
        });
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = `Last updated: ${timeString}`;
        }
    }
}

const dashboard = new TeamDashboard();