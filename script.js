// Simple keyword-based "AI" resume reviewer
const skills = [
  'python','java','c++','c','javascript','react','node','sql','mongodb','html','css','django','flask','git','docker','kubernetes','aws','azure','gcp','data structures','algorithms','machine learning','ml','deep learning','nlp','computer vision','linux','bash']
const educationKeywords = ['bachelor','b.tech','mca','master','b.sc','m.tech','b.e','bcom','mba','degree','college','university']
const projectKeywords = ['project','developed','implemented','built','designed','created']

const resumeInput = document.getElementById('resumeInput')
const fileInput = document.getElementById('fileInput')
const analyzeBtn = document.getElementById('analyzeBtn')
const summary = document.getElementById('summary')
const suggestions = document.getElementById('suggestions')
const skillsList = document.getElementById('skillsList')
const highlightedResume = document.getElementById('highlightedResume')
const highlightMatchesCheckbox = document.getElementById('highlightMatches')
const downloadReportBtn = document.getElementById('downloadReport')

fileInput.addEventListener('change', e=>{
  const f = e.target.files && e.target.files[0]
  if(!f) return
  const reader = new FileReader()
  reader.onload = evt => resumeInput.value = evt.target.result
  reader.readAsText(f)
})

analyzeBtn.addEventListener('click', analyze)

downloadReportBtn.addEventListener('click', ()=>{
  const report = generateReportText()
  const blob = new Blob([report], {type: 'text/plain'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'resume_review_report.txt'
  a.click()
  URL.revokeObjectURL(url)
})

function analyze(){
  const text = (resumeInput.value || '').toLowerCase()
  if(!text.trim()){ alert('Please paste or upload resume text first.'); return }

  const foundSkills = []
  for(const s of skills){
    const pattern = new RegExp('\\b'+escapeRegex(s)+'\\b','i')
    if(pattern.test(text)) foundSkills.push(s)
  }

  const foundEdu = educationKeywords.some(k=> new RegExp('\\b'+escapeRegex(k)+'\\b','i').test(text))
  const foundProject = projectKeywords.some(k=> new RegExp('\\b'+escapeRegex(k)+'\\b','i').test(text))

  summary.innerHTML = `<p>Found <strong>${foundSkills.length}</strong> skills. Education section present: <strong>${foundEdu ? 'Yes' : 'No'}</strong>. Projects mentioned: <strong>${foundProject ? 'Yes' : 'No'}</strong>.</p>`

  const sug = []
  if(foundSkills.length < 4) sug.push('Add more technical skills and tools (mention versions where possible).')
  if(!foundProject) sug.push('Add a "Projects" section describing 2–3 technical projects (what you built, technologies, your role).')
  if(!foundEdu) sug.push('Add your education (degree, college, year).')
  if(!/data structures/.test(text) && !/algorithms/.test(text)) sug.push('If you are applying for developer roles, include coursework or projects that show Data Structures & Algorithms knowledge.')
  if(/intern/.test(text)===false && /experience/.test(text)===false) sug.push('Mention internships or practical experience if any, even small freelance or college projects.')

  suggestions.innerHTML = ''
  if(sug.length===0) suggestions.innerHTML = '<li>Resume looks good for a frontend prototype review — consider tailoring for specific job descriptions.</li>'
  else sug.forEach(s=>{
    const li = document.createElement('li'); li.textContent = s; suggestions.appendChild(li)
  })

  skillsList.innerHTML = ''
  for(const s of skills.slice(0,30)){
    const chip = document.createElement('div')
    chip.className = 'skill-chip ' + (foundSkills.includes(s) ? 'found' : 'missing')
    chip.textContent = s
    skillsList.appendChild(chip)
  }

  if(highlightMatchesCheckbox.checked){
    highlightedResume.innerHTML = highlightText(resumeInput.value, foundSkills)
  } else {
    highlightedResume.textContent = resumeInput.value
  }
}

function generateReportText(){
  return `AI Resume Reviewer Report\nGenerated: ${new Date().toLocaleString()}\n\nInput Resume:\n${resumeInput.value}\n\nSummary:\n${summary.textContent}\n\nSuggestions:\n${Array.from(suggestions.querySelectorAll('li')).map(l=>'- '+l.textContent).join('\n')}`
}

function highlightText(text, foundSkills){
  let out = escapeHtml(text)
  for(const s of foundSkills){
    const re = new RegExp('('+escapeRegex(s)+')','ig')
    out = out.replace(re, '<span class="match">$1</span>')
  }
  const eduPattern = new RegExp('('+educationKeywords.join('|') +')','ig')
  out = out.replace(eduPattern, '<span class="highlight">$1</span>')
  return out
}

function escapeRegex(s){ return s.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&') }
function escapeHtml(str){ return str.replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]) }

resumeInput.value = `John Doe\nEmail: john@example.com\n\nObjective\nAspiring software developer with experience in projects using JavaScript and Python.\n\nSkills\nJavaScript, HTML, CSS, React, Node, SQL\n\nProjects\n- Student Management System (JavaScript, localStorage)\n`;

analyze()