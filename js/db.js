dba = {}; // database adapter

dba.init = async function(){
  this.db = new Dexie("tasks_db");
  this.db.version(1).stores({
    projects: "name",
    tasks: "++id,name,isOpen,project"
  });
  await this.db.open();
}

dba.addProject = async function(projectName){
  try{
    await this.db.projects.add({name: projectName});    
  }
  catch(error){
    console.log(error);
  }
}

dba.listProjects = async function(){
  try{
    var records = await this.db.projects.toArray();
    var projects = [];
    for(var i=0;i<records.length;i++){
      projects.push(records[i].name);
    }
    projects.sort(function(p_a,p_b){
      return p_a.localeCompare(p_b);
    })
    return projects;    
  }
  catch(error){
    console.log(error);
    return []
  }
}

dba.addTask = async function(taskName,projectName){
  try{
    var projectExists = await this.db.projects.get(projectName);
    if(projectExists){
      this.db.tasks.add({name:taskName, project:projectName, isOpen: 1});
    }    
  }
  catch(error){
    console.log(error);
  }
}

dba.listTasks = async function(project,showClosedTasks){
  try{
    var status = 0;
    if(showClosedTasks){
      status = -1;
    }
    var tasks = []
    if(project){ 
      tasks = (await this.db.tasks
                .where('isOpen').above(status)
                .and(record => record.project===project)
                .toArray());   
    }
    else{      
      tasks = (await this.db.tasks.where('isOpen').above(status).toArray());    
    }
    tasks.sort(function(t_a,t_b){
      return t_a.name.localeCompare(t_b.name);
    })
    return tasks;
  }
  catch(error){
    console.log(error);
    return []
  }
}


dba.closeTask = async function(id){
  try{
    await this.db.tasks.update(id,{isOpen:0});
  }
  catch(error){
    console.log(error);
  }
}

dba.openTask = async function(id){
  try{
    await this.db.tasks.update(id,{isOpen:1});
  }
  catch(error){
    console.log(error);
  }
}

dba.deleteTask = async function(id){
  try{
    await this.db.tasks.delete(id);
  }
  catch(error){
    console.log(error);
  }
}

